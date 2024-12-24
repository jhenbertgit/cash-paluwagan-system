import { Schema, model, models } from "mongoose";

const RecipientSchema = new Schema({
  member: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receivedAt: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  cycleYear: {
    type: Number,
    required: true,
  },
  cycleMonth: {
    type: Number,
    required: true,
  }
});

const Recipient = models.Recipient || model("Recipient", RecipientSchema);
export default Recipient; 