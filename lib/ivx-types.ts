export type ID = string;

export type ProductType = "physical" | "digital";

export interface IVXProduct {
  id: ID;
  title: string;
  price: number;
  type: ProductType; // "physical" => Online Products, "digital" => Digital Products
  tags: string[];
  image?: string;
  for?: { kind: "video" | "event"; id: ID };
}

export type CatalogKind = "video" | "event";

export interface IVXSelection {
  kind: CatalogKind;
  id: ID;
}

export interface IVXProductCache {
  status: "idle" | "loading" | "success" | "error";
  items: IVXProduct[];
  error?: string;
}

export interface IVXStoreState {
  selected: IVXSelection | null;
  productCache: Record<string, IVXProductCache>;
  walletXUT: number;
  cartCount: number;
}

export type IVXStoreAction = 
  | { type: "SELECT_ITEM"; payload: IVXSelection }
  | { type: "LOAD_PRODUCTS_REQUEST"; payload: { key: string } }
  | { type: "LOAD_PRODUCTS_SUCCESS"; payload: { key: string; items: IVXProduct[] } }
  | { type: "LOAD_PRODUCTS_FAILURE"; payload: { key: string; error: string } }
  | { type: "UPDATE_WALLET"; payload: { balance: number } }
  | { type: "UPDATE_CART"; payload: { count: number } };