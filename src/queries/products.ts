import axios, { AxiosError } from "axios";
import API_PATHS from "~/constants/apiPaths";
import { AvailableProduct } from "~/models/Product";
import { useQuery, useQueryClient, useMutation } from "react-query";
import React from "react";

interface IStock {
  product_id: string;
  count: number;
}

interface IProducts {
  description: string;
  id: string;
  price: number;
  title: string;
}

type FullDataType = Array<Omit<IStock, "product_id"> & IProducts>;

export function useAvailableProducts() {
  return useQuery<AvailableProduct[], AxiosError>(
    "available-products",
    async () => {
      const res = await axios.get(`${API_PATHS.bff}/products`);
      const stock = await axios.get(`${API_PATHS.bff}/stock`);
      const productsData = JSON.parse(res.data.products);
      const stockData = JSON.parse(stock.data.stock);
      if (productsData.length && stockData.length) {
        const fullData: FullDataType = [];
        productsData.forEach((product: IProducts) => {
          const id = product.id;
          const count = stockData.filter(
            (stock: IStock) => stock.product_id === id
          );
          if (count.length) {
            const fullProduct = { ...product, count: count[0].count };
            fullData.push(fullProduct);
          } else {
            fullData.push({ ...product, count: 0 });
          }
        });
        return fullData;
      }
      return [];
    }
  );
}

export function useInvalidateAvailableProducts() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("available-products", { exact: true }),
    []
  );
}

export function useAvailableProduct(id?: string) {
  return useQuery<AvailableProduct, AxiosError>(
    ["product", { id }],
    async () => {
      const res = await axios.get<AvailableProduct>(
        `${API_PATHS.bff}/product/${id}`
      );
      return res.data;
    },
    { enabled: !!id }
  );
}

export function useRemoveProductCache() {
  const queryClient = useQueryClient();
  return React.useCallback(
    (id?: string) =>
      queryClient.removeQueries(["product", { id }], { exact: true }),
    []
  );
}

export function useUpsertAvailableProduct() {
  return useMutation((values: AvailableProduct) =>
    axios.put<AvailableProduct>(`${API_PATHS.bff}/product`, values, {
      headers: {
        Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
      },
    })
  );
}

export function useDeleteAvailableProduct() {
  return useMutation((id: string) =>
    axios.delete(`${API_PATHS.bff}/product/${id}`, {
      headers: {
        Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
      },
    })
  );
}
