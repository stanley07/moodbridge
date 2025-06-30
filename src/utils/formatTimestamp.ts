export const formatTimestamp = (input: string | Date): string => {
    return new Date(input).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  