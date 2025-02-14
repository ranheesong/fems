import { modals } from "@mantine/modals";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import toast from "react-hot-toast";

const useMutationCustom = (
    endpoint: string,
    queryKey: any[],
    options?: { method: string }
) => {
    const queryClient = useQueryClient();

    const fetchURL = new URL(endpoint, "http://localhost:8000");
    return useMutation({
        mutationFn: async (createData) => {
            return fetch(fetchURL.href, {
                method: options?.method,
                body: JSON.stringify(createData),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then(async (res) => {
                const json = await res.json();
                console.log(json.detail);

                if (!res.ok) {
                    throw new Error(json.detail.replaceAll("\\n", "\n"));
                }
                return json;
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
};

export default useMutationCustom;
