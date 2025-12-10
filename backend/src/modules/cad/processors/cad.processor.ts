import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CadMetadata, CadMetadataDocument } from '@/database/schemas/cad-metadata.schema';
import { CadProcessorService } from '../services/cad-processor.service';

@Processor('cad-processing')
@Injectable()
export class CadProcessor extends WorkerHost {
  constructor(
    @InjectModel(CadMetadata.name)
    private cadMetadataModel: Model<CadMetadataDocument>,
    private cadProcessorService: CadProcessorService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    const { drawingId, filePath } = job.data;

    try {
      // Update status to processing
      await this.cadMetadataModel.updateOne(
        { drawingId },
        { processingStatus: 'processing' },
      );

      // Process the CAD file
      const result = await this.cadProcessorService.processFile(filePath);

      // Update metadata with results
      await this.cadMetadataModel.updateOne(
        { drawingId },
        {
          ...result,
          processingStatus: 'completed',
        },
      );

      return { success: true, drawingId };
    } catch (error) {
      // Update status to failed
      await this.cadMetadataModel.updateOne(
        { drawingId },
        {
          processingStatus: 'failed',
          processingErrors: {
            message: error.message,
            stack: error.stack,
          },
        },
      );

      throw error;
    }
  }
}
