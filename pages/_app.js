
import "../styles/theme.css";
import "../styles/output.css";
import "../styles/index.scss";
import { ThemeProvider } from 'next-themes'
import { SnackbarProvider } from "notistack";
import { XRPLProvider } from "../contexts/XRPLContext";

function MyApp({ Component, pageProps }) {
	return (
		<SnackbarProvider anchorOrigin={{ vertical: "top", horizontal: "right" }} maxSnack={5} autoHideDuration={3000} >
			<XRPLProvider>
				<ThemeProvider defaultTheme={"dark"} enableColorScheme={false} attribute="class" enableSystem={false}>
					<Component {...pageProps} />
				</ThemeProvider>
			</XRPLProvider>
		</SnackbarProvider>
	);
}

export default MyApp;
