import useSWR from "swr";

const fetcher = (...args: Parameters<typeof fetch>) =>
	fetch(...args).then((res) => res.json());
function App() {
	const { data, error, isLoading } = useSWR("/sessions", fetcher);
	console.log(data);
	return <h1>hello world</h1>;
}

export default App;
