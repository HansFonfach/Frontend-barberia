import React, { useState } from "react";
import { Container, Row, Col, Card, CardBody, Alert, Button } from "reactstrap";
import { Salad } from "lucide-react";
import UserHeader from "components/Headers/UserHeader.js";

/**
 * "Plan alimenticio": ideas generales de comida (desayuno/almuerzo/cena/
 * snacks) pensadas para bajar grasa manteniendo músculo. A propósito es
 * solo un listado curado, NO un plan calculado con calorías/macros — eso
 * requeriría datos reales de la persona (peso, actividad, objetivos
 * específicos) y lo ideal ahí es un nutricionista. Separado de "Mi
 * entrenamiento" para no llenar una sola página con todo.
 */

const DESAYUNOS = [
  "Huevos revueltos (2-3) + palta + pan integral o tortilla de avena",
  "Yogurt griego natural + fruta + puñado de nueces o granola sin azúcar",
  "Avena cocida con leche o bebida vegetal + plátano + canela",
  "Tostadas integrales + queso fresco o ricotta + tomate",
];
const ALMUERZOS = [
  "Pechuga de pollo o pavo a la plancha + arroz o quinoa + ensalada variada",
  "Salmón o atún al horno + papas o camote + verduras salteadas",
  "Carne magra (posta, lomo) + legumbres (lentejas, garbanzos) + ensalada",
  "Bowl de proteína (pollo o tofu) + arroz integral + palta + verduras crudas",
];
const CENAS = [
  "Ensalada grande con proteína (pollo, huevo, atún) + aceite de oliva",
  "Tortilla de verduras + ensalada",
  "Sopa de verduras con proteína (pollo desmenuzado o legumbres)",
  "Pescado a la plancha + verduras al vapor",
];
const SNACKS = [
  "Yogurt griego natural",
  "Puñado de almendras o nueces (10-12 unidades)",
  "Una fruta (manzana, plátano, naranja)",
  "Huevo duro",
  "Palta con sal en una tostada integral pequeña",
  "Queso fresco light + tomate",
  "Batido de proteína con agua o leche",
  "Zanahorias baby o apio con hummus",
];

const PlanAlimenticio = () => {
  const [snackSugerido, setSnackSugerido] = useState(null);

  const elegirSnack = () => {
    const otro = SNACKS[Math.floor(Math.random() * SNACKS.length)];
    setSnackSugerido(otro);
  };

  return (
    <>
      <UserHeader />
      <Container className="mt--7 mb-5" fluid>
        <Row className="justify-content-center">
          <Col xl="10" lg="11">
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
              <CardBody className="text-center py-5">
                <div className="bg-success rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                  <Salad size={28} className="text-white" />
                </div>
                <h1 className="font-weight-bold display-4">Plan alimenticio</h1>
                <p className="text-muted lead mb-0">
                  Ideas para comer, pensadas para bajar grasa manteniendo músculo
                </p>
              </CardBody>
            </Card>

            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
              <CardBody className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap" style={{ gap: 8 }}>
                  <h4 className="mb-0">🥗 Ideas para comer</h4>
                  <Button size="sm" color="info" onClick={elegirSnack}>
                    Tengo hambre ahora
                  </Button>
                </div>
                <p className="text-muted small mb-4">
                  Ideas generales — proteína en cada comida, comida real. No es un
                  plan nutricional calculado para ti (no considera tu peso,
                  actividad ni objetivos específicos); para algo más preciso, lo
                  ideal es un nutricionista.
                </p>

                {snackSugerido && (
                  <Alert color="info" style={{ borderRadius: 12 }}>
                    <strong>¿Hambre ahora?</strong> Prueba con: {snackSugerido}
                  </Alert>
                )}

                <Row>
                  {[
                    { titulo: "☀️ Desayuno", items: DESAYUNOS },
                    { titulo: "🍽️ Almuerzo", items: ALMUERZOS },
                    { titulo: "🌙 Cena", items: CENAS },
                    { titulo: "🍎 Snacks", items: SNACKS },
                  ].map((seccion) => (
                    <Col md="6" key={seccion.titulo} className="mb-4">
                      <h6 className="font-weight-bold mb-2">{seccion.titulo}</h6>
                      {seccion.items.map((item, i) => (
                        <p key={i} className="text-muted small mb-2">
                          • {item}
                        </p>
                      ))}
                    </Col>
                  ))}
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PlanAlimenticio;
