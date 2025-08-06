import { Controller, Get } from "@nestjs/common";
import { MembersService } from "./members.service";
import { ApiTags } from "@nestjs/swagger";

@Controller("members")
@ApiTags("Members")
export class MembersController {
    constructor(private readonly membersService: MembersService) {}

    @Get()
    async findAll() {
        return this.membersService.findAll();
    }
}
