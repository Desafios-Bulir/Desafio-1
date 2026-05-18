
export function isValidNif(nif: string): boolean 
{
  if (!nif || typeof nif !== 'string') return false;
  if (nif.length !== 10) return false;
  if (!/^\d+$/.test(nif))  return false;
  if (nif[0] !== '5') return false;
  return true;
}
