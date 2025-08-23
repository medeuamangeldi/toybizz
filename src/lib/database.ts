import { MongoClient, Db, Collection } from "mongodb";

let client: MongoClient;
let db: Db;

export async function connectToDatabase() {
  if (!client) {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.error("❌ MONGODB_URI environment variable is not set");
      throw new Error("MONGODB_URI environment variable is not set");
    }

    console.log("🔄 Connecting to MongoDB...");
    client = new MongoClient(uri);
    await client.connect();
    db = client.db("toybiz");

    console.log("📊 Creating database indexes...");
    // Create indexes for better performance
    const eventsCollection = db.collection("events");
    const registrationsCollection = db.collection("registrations");

    await Promise.all([
      eventsCollection.createIndex({ eventId: 1 }, { unique: true }),
      eventsCollection.createIndex({ userId: 1 }),
      eventsCollection.createIndex({ createdAt: -1 }),
      registrationsCollection.createIndex({ eventId: 1 }),
      registrationsCollection.createIndex({ registeredAt: -1 }),
    ]);

    console.log("✅ Connected to MongoDB Atlas");
  }
  return { client, db };
}

export interface EventData {
  _id?: string;
  eventId: string;
  userId?: string;
  title: string;
  name?: string; // For backward compatibility
  eventType: string;
  type?: string; // For backward compatibility
  brideName?: string;
  groomName?: string;
  eventName?: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  language?: string;
  style?: string;
  theme?: string;
  customStyle?: string;
  schedule?: { time: string; activity: string; event?: string }[];
  rsvpText?: string;
  additionalInfo?: string;
  photoUrls: string[]; // Array of photo file IDs
  melodyUrl?: string; // Melody file ID or URL
  photos: string[]; // Deprecated - use photoUrls instead
  htmlContent: string; // For backward compatibility
  stylePreference: number;
  createdAt: Date;
  updatedAt?: string;
}

export interface Registration {
  _id?: string;
  eventId: string;
  name: string;
  phone?: string;
  willAttend: boolean;
  guestCount?: number;
  registeredAt: Date;
}

// Get collections
export async function getEventsCollection(): Promise<Collection<EventData>> {
  const { db } = await connectToDatabase();
  return db.collection<EventData>("events");
}

export async function getRegistrationsCollection(): Promise<
  Collection<Registration>
> {
  const { db } = await connectToDatabase();
  return db.collection<Registration>("registrations");
}

// Helper functions
export async function saveEvent(eventData: EventData) {
  const collection = await getEventsCollection();
  const result = await collection.insertOne(eventData);
  return result.insertedId.toString();
}

export async function getEvent(eventId: string): Promise<EventData | null> {
  const collection = await getEventsCollection();
  return await collection.findOne({ eventId });
}

export async function getUserEvents(userId: string): Promise<EventData[]> {
  const collection = await getEventsCollection();
  return await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
}

export async function saveRegistration(registration: Registration) {
  const collection = await getRegistrationsCollection();
  const result = await collection.insertOne(registration);
  return result.insertedId.toString();
}

export async function getEventRegistrations(
  eventId: string
): Promise<Registration[]> {
  const collection = await getRegistrationsCollection();
  return await collection
    .find({ eventId })
    .sort({ registeredAt: -1 })
    .toArray();
}

export async function getRegistrationCount(eventId: string): Promise<number> {
  const collection = await getRegistrationsCollection();
  return await collection.countDocuments({ eventId });
}
