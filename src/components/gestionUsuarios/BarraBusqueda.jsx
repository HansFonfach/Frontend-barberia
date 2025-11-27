import React from 'react';
import { Row, Col, Input, InputGroup, InputGroupAddon, InputGroupText, Badge } from 'reactstrap';

const BarraBusqueda = ({ busqueda, onBusquedaChange, placeholder, totalResultados }) => (
  <Row className="mb-4">
    <Col lg="6">
      <InputGroup className="input-group-alternative">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <i className="ni ni-zoom-split-in"></i>
          </InputGroupText>
        </InputGroupAddon>
        <Input
          placeholder={placeholder}
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          className="form-control-alternative"
        />
      </InputGroup>
    </Col>
    <Col lg="6" className="d-flex align-items-center justify-content-end">
      <Badge color="primary" className="badge-dot mr-2">
        <i className="bg-primary"></i>
      </Badge>
      <span className="text-sm text-muted">
        {totalResultados} encontrados
      </span>
    </Col>
  </Row>
);

export default BarraBusqueda;