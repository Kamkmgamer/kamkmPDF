/**
 * Seed Polar Products Script
 * Run with: pnpm tsx scripts/seed-polar-products.ts
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { polarProducts } from "../src/server/db/schema";

// Create database connection directly
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString);
const db = drizzle(client);

async function seedPolarProducts() {
  console.log("🌱 Seeding Polar products...");

  const products = [
    {
      id: "prod-config-professional",
      tier: "professional" as const,
      productId: "24424dd6-52ff-4df2-a0ee-5b937c13cc91",
      name: "Professional Plan",
      description: "Full access to all professional features",
      isActive: true,
    },
    {
      id: "prod-config-classic",
      tier: "classic" as const,
      productId: "0246f64d-c711-4188-8b54-bc46796ca4be",
      name: "Classic Plan",
      description: "Classic tier with essential features",
      isActive: true,
    },
    {
      id: "prod-config-business",
      tier: "business" as const,
      productId: "155a49a9-c8d3-4db6-8e52-c7acdafc128e",
      name: "Business Plan",
      description: "Advanced features for growing businesses",
      isActive: true,
    },
    {
      id: "prod-config-enterprise",
      tier: "enterprise" as const,
      productId: "e0e5a552-6ea7-4241-9215-112b7cbd334e",
      name: "Enterprise Plan",
      description: "Complete solution for large organizations",
      isActive: true,
    },
  ];

  try {
    for (const product of products) {
      console.log(`  → Inserting ${product.tier} plan...`);
      
      await db
        .insert(polarProducts)
        .values({
          ...product,
          createdAt: new Date(),
        })
        .onConflictDoUpdate({
          target: polarProducts.tier,
          set: {
            productId: product.productId,
            name: product.name,
            description: product.description,
            isActive: product.isActive,
            updatedAt: new Date(),
          },
        });
    }

    console.log("✅ Successfully seeded all Polar products!");
    
    // Verify
    console.log("\n📋 Verifying products in database:");
    const allProducts = await db.select().from(polarProducts);
    
    console.table(
      allProducts.map((p) => ({
        Tier: p.tier,
        "Product ID": p.productId,
        Name: p.name,
        Active: p.isActive ? "✓" : "✗",
      }))
    );
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    await client.end();
    process.exit(1);
  }
}

void seedPolarProducts();
