

export const GetAllEvents = async (): Promise<any[]> => {
  const res = await fetch('http://192.168.110.23:5000/api/event');
  if (!res.ok) throw new Error('Failed to fetch events');
  const data = await res.json();
  return data.data;

};