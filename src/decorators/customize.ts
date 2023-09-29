import { ExecutionContext, SetMetadata, createParamDecorator } from "@nestjs/common";

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true); // bypass auth guard

export const RESPONSE_MESSAGE = 'response_message'
export const ResponseMessage = (message: string) => SetMetadata(RESPONSE_MESSAGE, message); // customize response message

export const UserDecorator = createParamDecorator(                       // @User()
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);