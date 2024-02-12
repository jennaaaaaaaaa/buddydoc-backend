import { ApiProperty } from '@nestjs/swagger';
import { skills } from '@prisma/client';

export class SkillsEntity implements skills {

    @ApiProperty()
    userId: number;

    @ApiProperty()
    skill: string;

    @ApiProperty()
    createdAt: Date | null;
}