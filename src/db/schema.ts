import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";

// Players / participants
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Disciplines / games in the tournament
export const disciplines = pgTable("disciplines", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull().default("🎮"),
  isActive: boolean("is_active").notNull().default(true),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Results per player per discipline
export const results = pgTable(
  "results",
  {
    id: serial("id").primaryKey(),
    playerId: integer("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    disciplineId: integer("discipline_id")
      .notNull()
      .references(() => disciplines.id, { onDelete: "cascade" }),
    place: integer("place").notNull(), // 1st, 2nd, 3rd etc.
    score: integer("score").notNull(), // points awarded (= number of participants - place + 1, or custom)
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("unique_player_discipline").on(
      table.playerId,
      table.disciplineId
    ),
  ]
);

// Simple update log so the frontend knows when to refresh
export const updateLog = pgTable("update_log", {
  id: serial("id").primaryKey(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
