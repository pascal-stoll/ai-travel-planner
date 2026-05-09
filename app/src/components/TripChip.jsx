import './TripChip.css';

const TripChip = ({ label, color }) => (
  <span className="trip-chip" style={{ backgroundColor: color }}>
    {label}
  </span>
);

export default TripChip;
