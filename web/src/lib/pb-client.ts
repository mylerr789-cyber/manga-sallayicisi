"use client";

import PocketBase from "pocketbase";
import { PB_URL } from "./pb";

/** Tarayıcı tarafı tekil PB instance — auth localStorage'da kalıcı. */
let client: PocketBase | null = null;

export function pbClient(): PocketBase {
  if (!client) {
    client = new PocketBase(PB_URL);
    client.autoCancellation(false);
  }
  return client;
}

export function isAdmin(): boolean {
  const pb = pbClient();
  return pb.authStore.isValid && pb.authStore.record?.collectionName === "_superusers";
}
