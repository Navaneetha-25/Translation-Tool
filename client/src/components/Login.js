import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Container, Card } from "react-bootstrap";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return;
    }

    // Basic check (No real authentication)
    if (email && password) {
      navigate("/translate"); // Redirect to translation page
    } else {
      setError("Please enter email and password");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: "350px", padding: "20px" }}>
        <h3 className="text-center">Login</h3>
        <Form onSubmit={handleLogin}>
          {error && <p className="text-danger text-center">{error}</p>}
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">Login</Button>
        </Form>
        <div className="text-center mt-3">
          <p>Don't have an account?{" "}
            <span className="text-primary" style={{cursor:"pointer"}} onClick={()=>navigate("/signup")}>
              Create one 
            </span>
          </p>
        </div>
      </Card>
    </Container>
  );
};

export default Login;