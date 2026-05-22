import React from "react";
import { InputGroup, InputGroupAddon, InputGroupText, Input } from "reactstrap";
import { FiSearch } from "react-icons/fi";

const BarraBusquedaProductos = ({ busqueda, setBusqueda }) => {
  return (
    <InputGroup className="input-group-alternative shadow-sm">
      <InputGroupAddon addonType="prepend">
        <InputGroupText>
          <FiSearch />
        </InputGroupText>
      </InputGroupAddon>

      <Input
        placeholder="Buscar productos..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
    </InputGroup>
  );
};

export default BarraBusquedaProductos;