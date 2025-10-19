/**
 * Seed Credit Package Products in Database
 * Run this script to add credit package product IDs to the database
 * 
 * Usage: pnpm tsx scripts/seed-credit-products.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { sql } from "drizzle-orm";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env") });

interface CreditProduct {
  id: string;
  name: string;
  credits: number;
  productId: string;
  price: number;
  isActive: boolean;
}

const creditProducts: CreditProduct[] = [
  {
    id: "credits_50",
    name: "50 Credits",
    credits: 50,
    productId: "", // TODO: Add your Polar product ID here
    price: 1,
    isActive: true,
  },
  {
    id: "credits_500",
    name: "500 Credits",
    credits: 500,
    productId: "", // TODO: Add your Polar product ID here
    price: 5,
    isActive: true,
  },
  {
    id: "credits_1000",
    name: "1000 Credits",
    credits: 1000,
    productId: "", // TODO: Add your Polar product ID here
    price: 10,
    isActive: true,
  },
];

async function seedCreditProducts() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const connection = postgres(process.env.DATABASE_URL);
  const db = drizzle(connection);

  try {
    console.log("✅ Connected to database");

    // Create table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pdfprompt_credit_product (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        credits INTEGER NOT NULL,
        product_id VARCHAR(255) NOT NULL UNIQUE,
        price DECIMAL(10, 2) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Table created/verified");

    // Insert or update products
    for (const product of creditProducts) {
      if (!product.productId) {
        console.log(`⚠️  Skipping ${product.name} - No product ID provided`);
        continue;
      }

      await db.execute(sql`
        INSERT INTO pdfprompt_credit_product (id, name, credits, product_id, price, is_active, updated_at)
        VALUES (${product.id}, ${product.name}, ${product.credits}, ${product.productId}, ${product.price}, ${product.isActive}, CURRENT_TIMESTAMP)
        ON CONFLICT (id) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          credits = EXCLUDED.credits,
          product_id = EXCLUDED.product_id,
          price = EXCLUDED.price,
          is_active = EXCLUDED.is_active,
          updated_at = CURRENT_TIMESTAMP;
      `);

      console.log(`✅ Seeded: ${product.name} (${product.credits} credits for $${product.price})`);
    }

    console.log("\n🎉 Credit products seeded successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Create products in Polar Dashboard for each credit package");
    console.log("2. Update the productId values in this script");
    console.log("3. Run this script again to update the database");
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding credit products:", error);
    await connection.end();
    process.exit(1);
  }
}

void seedCreditProducts();
