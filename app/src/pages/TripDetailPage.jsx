import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

function TripDetailPage() {
  const { tripId } = useParams();
  return <Navigate to={`/results?trip=${encodeURIComponent(tripId || '')}`} replace />;
}

export default TripDetailPage;
