import { INITIAL_ACCESS_RULES } from '../components/shared/Mockdata';

export function getDeviceStatus(device) {
  const rules = INITIAL_ACCESS_RULES[device.id];

  if (!rules) return 'warning';
  if (!device.name) return 'warning';
  if (rules.userIds.length === 0 && rules.groupIds.length === 0) return 'warning';

  return 'ok';
}
