import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'
import { Container, Navbar } from 'react-bootstrap'

const Header = ({ title, value }) => {
    return (
        <div>
            {/* <Container>
                <Navbar expand="lg" variant="light" bg="primary">
                    <Container>
                        <Navbar.Brand href="#">Navbar</Navbar.Brand>
                    </Container>
                </Navbar>
            </Container> */}
            <Button variant = 'primary'>
                {title}
                <Badge className = "bg-secondary">{value}</Badge>
            </Button>
        </div>
    )
}

Header.defaultProps = {
    title: 'Task Tracker',
    value: 0
}

export default Header
