import { Module } from "@medusajs/framework/utils"
import { DropshipService } from "./service"

export const DROPSHIP_MODULE = "dropship"

export default Module(DROPSHIP_MODULE, {
  service: DropshipService,
})

export * from "./service"
export * from "./models/supplier-mapping"
