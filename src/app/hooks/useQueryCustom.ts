import {
    keepPreviousData,
    useQuery,
    UseQueryOptions,
} from "@tanstack/react-query";

// URL과 파라미터를 받아서 데이터를 조회하는 훅
const useQueryCustom = (
    endpoint: string,
    params: Record<string, any>,
    options?: Omit<UseQueryOptions, "queryKey" | "queryFn">
) => {
    const fetchURL = new URL(endpoint, "http://localhost:8000");
    fetchURL.search = new URLSearchParams(params).toString();

    const useQueryResult = useQuery({
        queryKey: [endpoint, params],
        queryFn: ({ queryKey }) => {
            // const [url, params] = queryKey;
            return fetch(fetchURL.href).then(async (res) => {
                if (!res.ok) {
                    throw new Error(`${res.status} (${res.statusText})`);
                }
                return res.json();
            });
        },
        retry: 1,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,

        ...options,
    });

    return useQueryResult;
};

export default useQueryCustom;
