import { MiddlewareFn } from 'telegraf';
import { userService } from '../services/user.service';
import {loggerMiddleware} from "./logger";

export const userMiddleware: MiddlewareFn<any> = async (ctx, next) => {
  try {
    const { id, username, languageCode } = ctx.from;

    const referId = ctx.message?.text?.startsWith('/start ')
        ? Number(ctx.message.text.split(' ')[1])
        : null;

    const { user, isNew } = await userService.getOrCreateUser({
      _id: id,
      username,
      language: languageCode !== 'ru' ? 'en' : 'ru',
      referredBy: referId
    });

    if (user && isNew && referId) {
      try {
        await ctx.telegram.sendMessage(
            referId,
            `🎉 Поздравляем! У вас новый реферал: @${username || 'без username'}`
        );
      } catch (err) {
        await loggerMiddleware.logSystemEvent("error", 'Ошибка при отправке сообщения рефереру: ' + err);
      }
    }

    ctx.state.user = user;
    ctx.state.isNewUser = isNew;

    if (user.isBanned) {
      await ctx.reply('❌ Доступ к боту запрещён.');
      return;
    }

    await next();
  } catch (error) {
    await loggerMiddleware.logSystemEvent('error', 'User middleware error: ' + error);
  }
};
