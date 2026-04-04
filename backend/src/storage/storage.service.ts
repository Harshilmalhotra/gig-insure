import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as common from 'oci-common';
import * as os from 'oci-objectstorage';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private client: os.ObjectStorageClient | null = null;
  private readonly isConfigured: boolean;

  constructor(private configService: ConfigService) {
    const tenancyId = this.configService.get<string>('OCI_TENANCY_ID');
    const userId = this.configService.get<string>('OCI_USER_ID');
    const fingerprint = this.configService.get<string>('OCI_FINGERPRINT');
    const privateKey = this.configService.get<string>('OCI_PRIVATE_KEY');
    const regionName = this.configService.get<string>('OCI_REGION');

    if (tenancyId && userId && fingerprint && privateKey && regionName) {
      try {
        const provider = new common.SimpleAuthenticationDetailsProvider(
          tenancyId,
          userId,
          fingerprint,
          privateKey.replace(/\\n/g, '\n'), // handle newlines from env
          null,
          common.Region.fromRegionId(regionName)
        );

        this.client = new os.ObjectStorageClient({ authenticationDetailsProvider: provider });
        this.client.region = common.Region.fromRegionId(regionName);
        this.isConfigured = true;
      } catch (error) {
        console.error('Failed to initialize OCI Storage Service', error);
        this.isConfigured = false;
      }
    } else {
      console.warn('OCI credentials not fully provided. Storage Service starting in limited mode.');
      this.isConfigured = false;
    }
  }

  async uploadVideo(claimId: string, fileBuffer: Buffer): Promise<string> {
    if (!this.isConfigured || !this.client) {
      console.warn('OCI not configured, returning mock URL for uploadVideo.');
      return `https://RozgaarRaksha.network/evidence/mock-${claimId}.mp4`;
    }

    const namespace = this.configService.get<string>('OCI_NAMESPACE') || '';
    const bucketName = this.configService.get<string>('OCI_BUCKET_NAME') || '';
    const filename = `evidence_${claimId}_${Date.now()}.mp4`;

    try {
      const putObjectRequest: os.requests.PutObjectRequest = {
        namespaceName: namespace,
        bucketName: bucketName,
        objectName: filename,
        putObjectBody: fileBuffer,
        contentType: 'video/mp4',
      };

      await this.client.putObject(putObjectRequest);
      
      const region = this.client.region.regionId;
      return `https://objectstorage.${region}.oraclecloud.com/n/${namespace}/b/${bucketName}/o/${filename}`;
    } catch (error) {
      console.error('Error uploading to OCI', error);
      throw new InternalServerErrorException('Failed to upload evidence to secure storage');
    }
  }

}
