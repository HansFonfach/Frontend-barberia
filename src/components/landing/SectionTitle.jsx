import { Badge } from "reactstrap";

const SectionTitle = ({ badge, title, subtitle }) => (
  <div className="text-center mb-5">
    <Badge color="primary" pill className="mb-3 text-uppercase">
      {badge}
    </Badge>
    <h2 className="display-4 font-weight-bold">{title}</h2>
    {subtitle && <p className="lead text-muted mt-2">{subtitle}</p>}
  </div>
);

export default SectionTitle;