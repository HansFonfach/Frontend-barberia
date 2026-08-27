import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, Alert, Button, Badge, Spinner } from "reactstrap";
import { Salad, Calculator } from "lucide-react";
import UserHeader from "components/Headers/UserHeader.js";
import { useEntrenamientoPersonal } from "context/EntrenamientoPersonalContext";
import PerfilEntrenamientoForm from "components/gimnasio/PerfilEntrenamientoForm";

/**
 * "Plan alimenticio": arriba, tus calorías/macros calculados con una
 * fórmula real (Mifflin-St Jeor) a partir de tu objetivo, tu bitácora
 * (peso/altura) y tu frecuencia real de entrenamiento — no un número
 * inventado. Abajo, ideas de comida curadas para llegar a esos macros,
 * pensadas en general para bajar grasa manteniendo músculo. Separado de
 * "Mi entrenamiento" para no llenar una sola página con todo.
 */

const FALTANTE_LABEL = {
  objetivo: "tu objetivo (abajo, en \"Tu objetivo\")",
  sexoBiologico: "tu sexo biológico (abajo, en \"Tu objetivo\")",
  fechaNacimiento: "tu fecha de nacimiento (abajo, en \"Tu objetivo\")",
  pesoKg: "tu peso (en la bitácora de Mi entrenamiento)",
  alturaCm: "tu altura (en la bitácora de Mi entrenamiento)",
};

/* =======================================================
   Card de calorías/macros calculados — reacciona a cambios en el perfil
   (recarga cuando cambia "refrescarClave").
======================================================= */
const RecomendacionNutricional = ({ refrescarClave }) => {
  const { recomendacionNutricional } = useEntrenamientoPersonal();
  const [rec, setRec] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    recomendacionNutricional().then((data) => {
      setRec(data);
      setCargando(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refrescarClave]);

  return (
    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
      <CardBody className="p-4">
        <div className="d-flex align-items-center mb-2">
          <Calculator size={20} className="text-success mr-2" />
          <h4 className="mb-0">Tu meta calórica</h4>
        </div>

        {cargando ? (
          <div className="text-center py-3">
            <Spinner color="success" size="sm" />
          </div>
        ) : !rec?.disponible ? (
          <>
            <p className="text-muted small mb-2">
              Para calcular esto con datos reales (no una idea genérica), me falta:
            </p>
            <ul className="small text-muted mb-0 pl-3">
              {(rec?.faltantes || []).map((f) => (
                <li key={f}>{FALTANTE_LABEL[f] || f}</li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p className="text-muted small mb-3">
              Calculado con {rec.datosUsados.pesoKg}kg, {rec.datosUsados.alturaCm}cm,{" "}
              {rec.datosUsados.edad} años, objetivo "{rec.datosUsados.nombreObjetivo}" y tu
              nivel de actividad real ({rec.datosUsados.entrenamientosUltimos30Dias}{" "}
              entrenamientos en los últimos 30 días → {rec.datosUsados.nivelActividad}).
            </p>

            <div className="d-flex flex-wrap align-items-center mb-3" style={{ gap: 16 }}>
              <div className="text-center">
                <h1 className="font-weight-bold mb-0">{rec.caloriasObjetivo}</h1>
                <p className="text-muted small mb-0">kcal/día ({rec.ajusteObjetivo})</p>
              </div>
              <Badge color="light" pill className="border" style={{ fontSize: 13, padding: "8px 12px" }}>
                Mantenimiento: {rec.caloriasMantenimiento} kcal
              </Badge>
            </div>

            <Row>
              <Col xs="4" className="text-center">
                <h5 className="font-weight-bold mb-0">{rec.macros.proteinaG}g</h5>
                <p className="text-muted small mb-0">Proteína</p>
              </Col>
              <Col xs="4" className="text-center">
                <h5 className="font-weight-bold mb-0">{rec.macros.carbohidratosG}g</h5>
                <p className="text-muted small mb-0">Carbohidratos</p>
              </Col>
              <Col xs="4" className="text-center">
                <h5 className="font-weight-bold mb-0">{rec.macros.grasaG}g</h5>
                <p className="text-muted small mb-0">Grasas</p>
              </Col>
            </Row>

            <p className="text-muted small mt-3 mb-0">{rec.disclaimer}</p>
          </>
        )}
      </CardBody>
    </Card>
  );
};

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
  const [refrescarClave, setRefrescarClave] = useState(0);

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
                  Tus calorías/macros calculados, más ideas para llegar a esos números
                </p>
              </CardBody>
            </Card>

            <PerfilEntrenamientoForm onGuardado={() => setRefrescarClave((c) => c + 1)} />
            <RecomendacionNutricional refrescarClave={refrescarClave} />

            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
              <CardBody className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap" style={{ gap: 8 }}>
                  <h4 className="mb-0">🥗 Ideas para llegar a tus macros</h4>
                  <Button size="sm" color="info" onClick={elegirSnack}>
                    Tengo hambre ahora
                  </Button>
                </div>
                <p className="text-muted small mb-4">
                  Ideas generales — proteína en cada comida, comida real. No reemplazan
                  el número de arriba (que sí está calculado para ti); para armar un
                  menú exacto con esas cantidades, lo ideal es un nutricionista.
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
