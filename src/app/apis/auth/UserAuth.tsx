import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import authAxiosClient, { paymentAxiosClient } from "./axios";
import {
  clearAllData,
  setClientCookie,
  setLocalData,
  getClientCookie,
  removeClientCookie,
} from "@/src/core/config/localStorage";
import {
  fetchUserAddresses,
  fetchUserProfile,
} from "@/src/store/slices/userSlice";
import { AppDispatch } from "@/src/store";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { getFcmToken } from '@/src/core/utils/getFcmToken';

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Add SignupCredentials interface
interface SignupCredentials {
  email: string;
  password: string;
  userName: string;
  phoneNumber?: string;
  role?: string;
  otp?: string; // <-- Add this
}

interface SignupInitiate {
  email: string;
  password: string;
}

interface enhanceImages {
  userId: string;
  imageUrls: any;
  type: string;
  model: string;
  prompt: string;
  isAiPrompt: string;
  tags: any;
}
interface nftImage {
  imageUrls: any;
}

interface NewNft {
  collectionId: any;
  collectionName: string;
  supply: any;
  price: any;
  discount: any;
  userId: string;
  nftName: string;
  description: string;
  imageUrl: any;
  nftGame: string;
  nftAttribute: any;
  nftTags: any;
}
interface purchaseNft {
  userId: string;
  amount: number;
  // to: any;
  nftId: any;
  nftAmount: any;
}

interface Collection {
  EnterName: string;
  Blockchain: string;
  userId: string;
  Description: string;
  UploadLogo: any;
}

export const useAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [allcollection, SetAllCollection] = useState<string | null | any>(null);
  const [getallnfts, SetGetAllNfts] = useState<any[]>([]);
  const [nftbyid, SetnftbyId] = useState<any[]>([]);
  const [nftuserbyid, SetnftUserbyId] = useState<any[]>([]);
  const [buynft, SetBuyNft] = useState<any[]>([]);
  const [ImageUrl, setImageUrl] = useState<any[]>([]);
  const [nftcollectionbyid, SetNftCollectionById] = useState<any[]>([]);
  const [isapproved, SetIsApproved] = useState<any>("0");
  const [tokennn, setTokennn] = useState<any>("");
  const { showSuccess, showError, showWarning, showInfo } = useNotificationUtils();

  // useEffect(() => {
  //   let tkn = localStorage.getItem("adminAuthDetails");
  //   let tkndata = JSON.parse(tkn || "{}");
  //   setTokennn(tkndata);
  // }, [loading, ImageUrl]);

  const handleAuthSuccess = async (response: any, rememberMe: boolean) => {
    const accessToken = response.accessToken || response.token;
    if (!accessToken) return false;

    const expirySeconds = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;

    console.log('handleAuthSuccess - Raw accessToken:', accessToken);
    console.log('handleAuthSuccess - Token type:', typeof accessToken);
    console.log('handleAuthSuccess - Setting accessToken cookie with expiry:', expirySeconds);

    try {
      // Ensure token is a clean string
      const cleanToken = String(accessToken).trim();
      console.log('handleAuthSuccess - Clean token:', cleanToken);

      // Save available auth tokens
      setClientCookie("accessToken", cleanToken, {
        path: "/",
        maxAge: expirySeconds,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      // Verify cookie was set
      setTimeout(() => {
        const cookieValue = getClientCookie("accessToken");
        console.log('handleAuthSuccess - Cookie verification:', cookieValue);
        console.log('handleAuthSuccess - Cookie type:', typeof cookieValue);
        if (!cookieValue) {
          console.error('handleAuthSuccess - Failed to set accessToken cookie');
        } else {
          console.log('handleAuthSuccess - Cookie set successfully');
        }
      }, 200);

      if (response.refreshToken) {
        setClientCookie("refreshToken", String(response.refreshToken), {
          path: "/",
          maxAge: expirySeconds,
        });
      }

      if (response.idToken) {
        setClientCookie("idToken", String(response.idToken), {
          path: "/",
          maxAge: expirySeconds,
        });
      }

      await dispatch(fetchUserProfile());
      await dispatch(fetchUserAddresses());

      // Persist basic user details only
      setLocalData("userAuthDetails", {
        ...response.user,
        userId: response.id,
      });

      // Save remember me state in sessionStorage
      if (rememberMe) {
        sessionStorage.setItem("rememberMe", "true");
      } else {
        sessionStorage.removeItem("rememberMe");
      }

      setUser(response.user);

      return true;
    } catch (error) {
      console.error("Failed to save auth data:", error);
      showError('Auth Error', 'Failed to save authentication data');
      return false;
    }
  };

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authAxiosClient.post<any>(
          "/auth/login",
          credentials
        );

        if (!response?.data?.status || !response?.data?.data?.token) {
          throw new Error("Invalid response from server");
        }

        const success = await handleAuthSuccess(
          response.data.data,
          credentials?.rememberMe
        );

        if (success) {
          // After successful login, try to update FCM token
          try {
            const fcmToken = await getFcmToken();
            if (fcmToken) {
              // Call the update FCM token API
              await authAxiosClient.post("/auth/update-fcm-token", {
                fcmToken: fcmToken
              });
              console.log("FCM token updated successfully after login");
            }
          } catch (fcmError) {
            // Log the error but don't fail the login
            console.error("Failed to update FCM token after login:", fcmError);
            // Don't throw error - login should still be successful
          }

          showSuccess('Login Successful', 'Welcome back!');
          
          // Check if user came from QR code scan (has machine_id)
          const machineId = localStorage.getItem('kioskMachineId') || sessionStorage.getItem('kioskMachineId');
          if (machineId) {
            // Clear the stored machine_id and redirect to ad-management
            localStorage.removeItem('kioskMachineId');
            sessionStorage.removeItem('kioskMachineId');
            router.push(`/ad-management?machine_id=${encodeURIComponent(machineId)}`);
          } else {
            // Normal redirect to home page
            setTimeout(() => {
              router.push("/");
            }, 100);
            console.log("Redirecting to home page");
          }
          // Add a small delay to ensure cookies are set before navigation
      
          return response?.data?.data;
        } else {
          throw new Error("Failed to save auth data");
        }
      } catch (err: any) {
        setError(err);
        showError('Login Failed', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [router, showSuccess, showError]
  );

  // Add signup function
  const signup = useCallback(
    async (credentials: SignupCredentials & { otp?: string }) => {
      try {
        setLoading(true);
        setError(null);

        // Get the FCM token
        const fcmToken = await getFcmToken();


        const response: any = await authAxiosClient.post<any>("/auth/signup", {
          ...credentials,
          role: "user",
          fcmToken: fcmToken || "",
          otp: credentials.otp, // <-- Add this line
        });

        if (!response?.data?.status) {
          throw new Error("Signup failed");
        }
        const success = await handleAuthSuccess(
          response.data.data,
          true // Default to remember me for signup
        );

        if (success) {
          return response.data.data;
        }
        throw new Error("Failed to save auth data");
      } catch (err: any) {
        const errorMessage =
          typeof err === "string" ? err : err.message || "Signup failed";
        setError(errorMessage);
        showError('Signup Failed', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [router, showError]
  );

  const signupInitiate = useCallback(
    async (credentials: SignupInitiate) => {
      try {
        setLoading(true);
        setError(null);

        const response: any = await authAxiosClient.post<any>("/auth/signup/initiate", {
          email: credentials.email,
          password: credentials.password
        });

        // Always show the backend message in a toast
        const apiMessage = response?.data?.message || "Signup process completed.";
        if (response?.data?.status) {
          showSuccess("Signup", apiMessage);
        } else {
          showError("Signup", apiMessage);
        }
        return response.data;
      } catch (err: any) {
        const errorMessage =
          typeof err === "string" ? err : err.message || "Signup failed";
        setError(errorMessage);
        showError('Signup Failed', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [router, showSuccess, showError]
  );

  const logout = useCallback(async () => {
    try {
      setLoading(true);

      // Check if remember me was enabled and get saved credentials
      const rememberMe = sessionStorage.getItem("rememberMe");
      const savedCredentials = sessionStorage.getItem("savedCredentials");
      
      // Preserve machine_id before clearing data
      const machineId = localStorage.getItem("machine_id");

      // Clear all data including cookies
      clearAllData();

      // Wait a bit to ensure cookies are cleared
      await new Promise(resolve => setTimeout(resolve, 100));

      // Immediately restore remember me state and credentials if it was enabled
      if (rememberMe === "true" && savedCredentials) {
        sessionStorage.setItem("rememberMe", "true");
        sessionStorage.setItem("savedCredentials", savedCredentials);
      }
      
      // Restore machine_id if it existed
      if (machineId) {
        localStorage.setItem("machine_id", machineId);
      }

      // Redirect to home page instead of auth page
      window.location.replace("/");
    } catch (err: any) {
      showError('Logout Failed', 'Failed to logout properly');
    } finally {
      setLoading(false);
    }
  }, [showError]);


  const createCollection = useCallback(async (collections: Collection) => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append("name", collections.EnterName);
      formData.append("blockchain", collections.Blockchain);
      formData.append("userId", collections.userId);
      formData.append("description", collections.Description);
      formData.append("logo", collections.UploadLogo);
      const response = await paymentAxiosClient.post(
        `${process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL}/createCollection`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response;
    } catch (err: any) {
      const errorMessage =
        typeof err === "string"
          ? err
          : err.message || "Collection creation failed";
      setError(errorMessage);
      showError(errorMessage);
      // await refresh_Token();
      return null;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const getAllCollection = useCallback(async () => {
    // debugger
    try {
      setLoading(true);
      SetAllCollection(null);
      setError(null);
      const response = await authAxiosClient.get(
        `${process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL}/getAllCollection`,
      );
      if (response?.data?.data) {
        SetAllCollection(response?.data?.data);
      }
      return response;
    } catch (err: any) {


      err;
      const errorMessage =
        typeof err === "string"
          ? err
          : err.message || "Collection fetch failed" || "No token provided";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCollectionByid = useCallback(async (collectionId: string) => {
    try {
      setLoading(true);
      SetAllCollection(null);
      setError(null);
      const response = await paymentAxiosClient.get(
        `${process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL}/getCollection/${collectionId}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response;
    } catch (err: any) {
      const errorMessage =
        typeof err === "string"
          ? err
          : err.message || "did not fetch Id failed";
      setError(errorMessage);
      // await refresh_Token();
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCollection = useCallback(async (Id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentAxiosClient.get(
        `${process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL}/deleteCollection/${Id}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response) {
        return response;
      }

      return null;
    } catch (err: any) {
      const errorMessage =
        typeof err === "string" ? err : err.message || "Nft By Id fetch failed";
      setError(errorMessage);
      showError(errorMessage);
      // await refresh_Token();
      return null;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const createNFT = useCallback(async (collectionsofnft: NewNft) => {
    try {
      setLoading(true);
      setError(null);

      const requestBody = {
        collectionId: collectionsofnft?.collectionId,
        collectionName: collectionsofnft?.collectionName,
        supply: collectionsofnft?.supply,
        price: collectionsofnft?.price,
        discount: collectionsofnft?.discount,
        userId: collectionsofnft?.userId,
        nftName: collectionsofnft?.nftName,
        description: collectionsofnft?.description,
        imageUrl: collectionsofnft?.imageUrl,
        nftGame: collectionsofnft?.nftGame,
        nftAttribute: collectionsofnft?.nftAttribute,
        nftTags: collectionsofnft?.nftTags,
      };

      const response: any = await paymentAxiosClient.post(
        `${process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL}/createNft`,
        requestBody
      );
      if (response?.data) {
        localStorage.setItem("nftimageurl", response?.data?.imageUrl);
        localStorage.setItem("nftId", response?.data?.saveData?.id);
        localStorage.setItem(
          "collectionId",
          response?.data?.saveData?.collectionId
        );
      }

      return response;
    } catch (err: any) {
      const errorMessage =
        typeof err === "string"
          ? err
          : err.message || "Collection creation failed";
      setError(errorMessage);
      showError('NFT Creation Error', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const getAllNft = useCallback(async () => {
    try {
      setLoading(true);
      SetAllCollection(null);
      setError(null);
      const response = await paymentAxiosClient.get(
        `${process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL}/getAllNft`,
      );

      if (response?.data?.data) {
        SetGetAllNfts(response?.data?.data);
      }
      return response;
    } catch (err: any) {
      const errorMessage =
        typeof err === "string"
          ? err
          : err.message || "Collection fetch failed";
      setError(errorMessage);
      // await refresh_Token();
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getNftById = useCallback(async (nftId: string) => {
    try {
      setLoading(true);
      SetAllCollection(null);
      setError(null);
      const response: any = await paymentAxiosClient.get(
        `${process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL}/getNftById/${nftId}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response) {
        SetnftbyId(response.data);
      }
      return response;
    } catch (err: any) {
      const errorMessage =
        typeof err === "string"
          ? err
          : err.message || "did not fetch Id failed";
      setError(errorMessage);
      // await refresh_Token();
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getNftCollectionByid = useCallback(async (CollectionId: string) => {
    try {
      setLoading(true);
      SetAllCollection(null);
      setError(null);
      const response: any = await paymentAxiosClient.get(
        `${process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL}/getNftByCollectionId/${CollectionId}`,
        { headers: { "Content-Type": "application/json" } }
      );
      if (response) {
        SetNftCollectionById(response.data);
      }
      return response;
    } catch (err: any) {
      const errorMessage =
        typeof err === "string"
          ? err
          : err.message || "did not fetch Id failed";
      setError(errorMessage);
      // await refresh_Token();
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const imageEnhance = useCallback(
    async (Enhance: enhanceImages) => {
      try {
        setLoading(true);
        setError(null);

        const requestBody = {
          userId: Enhance.userId,
          imageUrls: Enhance.imageUrls,
          type: Enhance.type,
          model: Enhance.model,
          prompt: Enhance.prompt,
          isAiPrompt: Enhance.isAiPrompt,
          tags: Enhance.tags,
        };
        const response: any = await paymentAxiosClient.post(
          `${process.env.NEXT_PUBLIC_API_AI_BASE_URL}/ai-enhancement/images/enhance`,
          requestBody
        );

        if (response?.data) {
          const EnhanceUrl = response?.data?.enhancedImageUrl.replace(
            /^"|"$/g,
            ""
          );
          localStorage.setItem("enhanceImage", EnhanceUrl);
        }

        return response;
      } catch (err: any) {
        const errorMessage =
          typeof err === "string"
            ? err
            : err.message || "ImageEnhance creation failed";
        setError(errorMessage);
        setLoading(false);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const uploadNftImahe = useCallback(async (upload: nftImage) => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append("image", upload.imageUrls);
      const response: any = await paymentAxiosClient.post(
        `${process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL}/nftImageUpload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response?.data) {
        const cleanedUrl = response?.data?.imageUrl?.replace(/^"|"$/g, "");
        setImageUrl(cleanedUrl);
        localStorage.setItem("URLimage", cleanedUrl);
      }

      return response;
    } catch (err: any) {

      const errorMessage =
        typeof err === "string" ? err : err?.message || "nftimageupload failed";
      // setError(errorMessage);

      showError('Upload Error', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const purchaseNFT = useCallback(
    async (purchaseofnft: purchaseNft) => {
      try {
        setLoading(true);
        setError(null);
        const requestBody = {
          userId: purchaseofnft?.userId,
          amount: purchaseofnft?.amount,
          nftId: purchaseofnft?.nftId,
          nftAmount: purchaseofnft?.nftAmount,
        };

        const response: any = await paymentAxiosClient.post(
          `${process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL}/purchaseNft`,
          requestBody
        );
        return response;
      } catch (err: any) {
        const errorMessage =
          typeof err === "string"
            ? err
            : err.message || "Collection creation failed";
        setError(errorMessage);
        showError('Purchase Error', errorMessage);
        // await refresh_Token();
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showError]
  );

  const getUserBuyNft = useCallback(async (userId: any) => {
    try {
      setLoading(true);
      SetAllCollection(null);
      setError(null);


      if(!userId){
        removeClientCookie("accessToken");
        removeClientCookie("refreshToken");
        window.location.replace("/auth");
        return;
      }
      const response: any = await paymentAxiosClient.get(
        `${process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL}/getUserBuyNft/${userId}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response?.data?.data) {
        SetBuyNft(response.data?.data);
      }
      return response;
    } catch (err: any) {
      const errorMessage =
        typeof err === "string"
          ? err
          : err.message || "did not fetch Id failed";
      setError(errorMessage);
      // await refresh_Token();
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserNft = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response: any = await paymentAxiosClient.get(
        `${process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL}/getUserNft/${userId}`
      );
      if (response.data.data) {
        SetnftUserbyId(response.data.data);
      }
      return response;
    } catch (err: any) {
      const errorMessage =
        typeof err === "string"
          ? err
          : err.message || "did not fetch Id failed";
      // await refresh_Token();
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add FCM token update function
  const updateFcmToken = useCallback(async () => {
    try {
      const fcmToken = await getFcmToken();
      if (fcmToken) {
        const response = await authAxiosClient.post("/auth/update-fcm-token", {
          fcmToken: fcmToken
        });
        console.log("FCM token updated successfully");
        return response;
      }
      return null;
    } catch (error) {
      console.error("Failed to update FCM token:", error);
      throw error;
    }
  }, []);

  return {
    login,
    signup,
    handleAuthSuccess,
    logout,
    createCollection,
    getAllCollection,
    getCollectionByid,
    deleteCollection,
    createNFT,
    getAllNft,
    getNftById,
    getNftCollectionByid,
    imageEnhance,
    uploadNftImahe,
    purchaseNFT,
    getUserBuyNft,
    ImageUrl,
    getUserNft,
    updateFcmToken,
    SetIsApproved,
    SetAllCollection,
    isapproved,
    allcollection,
    getallnfts,
    nftbyid,
    nftuserbyid,
    buynft,
    nftcollectionbyid,
    loading,
    error,
    user,
    signupInitiate
  };
};