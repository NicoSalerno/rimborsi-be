import { Schema, model } from 'mongoose';
import { Verification } from './verification.entity';

const verficationSchema = new Schema<Verification>({
  username: String,
  createdAt: Date,
  validated: Boolean
})

verficationSchema.set('toJSON',{
  virtuals: true,
  transform: (_,ret) => {
    delete (ret as any)._id
    delete (ret as any).__v
    return ret;
  }
})

verficationSchema.set('toObject', {
    virtuals: true,
    transform: (_, ret) => {
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
    }
});

export const verficationModel = model<Verification>('verificationModel', verficationSchema);