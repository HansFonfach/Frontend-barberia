import React from "react";
import { Card, CardBody } from "reactstrap";
import { MapPin } from "lucide-react";

const InfoBarberia = () => (
  <Card className="shadow-sm border-0">
    <CardBody className="text-center text-muted">
      <MapPin size={22} className="mb-2 text-success" />
      <p className="mb-0">Av. Principal 1234, Ovalle</p>
      <small>Atención de lunes a sábado</small>
    </CardBody>
  </Card>
);

export default InfoBarberia;
