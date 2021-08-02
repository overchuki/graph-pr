import { useUpdateTheme } from "../contexts/ThemeContext";

const Home = () => {
    let updateTheme = useUpdateTheme();
    return <div>Home Page</div>;
};

export default Home;
