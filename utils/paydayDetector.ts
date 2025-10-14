import { User, WWPromptMode } from './types';

export function isPaydayWindow(): boolean {
  const today = new Date();
  const dayOfMonth = today.getDate();

  return (
    (dayOfMonth >= 1 && dayOfMonth <= 3) ||
    (dayOfMonth >= 15 && dayOfMonth <= 17)
  );
}

export function shouldShowWWPrompt(user: User): boolean {
  if (!user.hasCompletedOnboarding) return false;
  if (!isPaydayWindow()) return false;
  if (user.wwPromptDismissedForPayday) return false;

  if (!user.lastWWPromptShown) return true;

  const lastShown = new Date(user.lastWWPromptShown);
  const today = new Date();

  if (lastShown.getMonth() !== today.getMonth()) return true;

  const lastShownDay = lastShown.getDate();
  const todayDay = today.getDate();

  if (lastShownDay <= 3 && todayDay >= 15) return true;
  if (lastShownDay >= 15 && todayDay <= 3) return true;

  return false;
}

export function getWWPromptMode(user: User): WWPromptMode {
  if (!shouldShowWWPrompt(user)) return 'hidden';

  if (!user.firstDonationDate) return 'prominent';

  return 'subtle';
}
