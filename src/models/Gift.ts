import { Schema, model, models } from "mongoose";

export interface IGift {
  _id?: string;
  eventId: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  link?: string;
  image?: string;
  category?: string;
  priority?: "low" | "medium" | "high";
  isReserved?: boolean;
  reservedBy?: {
    name: string;
    email: string;
    phone?: string;
    reservedAt: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const GiftSchema = new Schema<IGift>(
  {
    eventId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: "₸",
      enum: ["₸", "$", "€", "₽"],
    },
    link: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      enum: [
        "Дом",
        "Кухня",
        "Техника",
        "Украшения",
        "Одежда",
        "Хобби",
        "Другое",
      ],
      default: "Другое",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isReserved: {
      type: Boolean,
      default: false,
    },
    reservedBy: {
      name: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      reservedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Gift = models.Gift || model<IGift>("Gift", GiftSchema);
