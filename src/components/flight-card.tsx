type FlightInfo = {
  flightNumber: string;
  departure: string;
  arrival: string;
  duration: string;
  gate: string;
  terminal: string;
};

export const getFlightInfo = (flightNumber: string): FlightInfo => ({
  flightNumber,
  departure: '10:00 AM',
  arrival: '12:00 PM',
  duration: '2 hours',
  gate: 'A1',
  terminal: '2',
});

type FlightCardProps = {
  flightInfo: FlightInfo;
};

export const FlightCard = ({ flightInfo }: FlightCardProps) => {
  return (
    <div>
      <div>Flight Number: {flightInfo.flightNumber}</div>
      <div>Departure: {flightInfo.departure}</div>
      <div>Arrival: {flightInfo.arrival}</div>
      <div>Duration: {flightInfo.duration}</div>
      <div>Gate: {flightInfo.gate}</div>
      <div>Terminal: {flightInfo.terminal}</div>
    </div>
  );
};
