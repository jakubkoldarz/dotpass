import { INITIAL_ACCESS_RULES } from '../components/shared/Mockdata';

type DeviceProps = {
  id: string; 
  name?: string;
  macaddress: string;
}


export function getDeviceStatus(device: DeviceProps): 'ok' | 'warning' {
  const rules = INITIAL_ACCESS_RULES[device.id as unknown as keyof typeof INITIAL_ACCESS_RULES];

  if (!rules) return 'warning';
  if (!device.name) return 'warning';
  if (rules.userIds.length === 0 && rules.groupIds.length === 0) return 'warning';

  return 'ok';
}