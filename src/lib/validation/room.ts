import { z } from "zod";

export const roomStatusEnum = z.enum(["VACANT", "OCCUPIED", "MAINTENANCE"]);

export const updateRoomSchema = z.object({
    baseRent: z.coerce.number().nonnegative("Giá phòng không âm").optional(),
    status: roomStatusEnum.optional(),
    isActive: z.boolean().optional(),
});

export const roomQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(200).default(50),
    search: z.string().optional(),
    status: roomStatusEnum.optional(),
    floor: z.coerce.number().int().positive().optional(),
});

export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type RoomQuery = z.infer<typeof roomQuerySchema>;
