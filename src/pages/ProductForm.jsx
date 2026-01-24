import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import productAPI from "../api/product";
import AuthContext from "../auth/AuthProvider";
import Toast from "../components/Toast";
import UnauthorizedModal from "../components/UnauthorizedModal";
import apiClient from "../api/client";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { access } = useContext(AuthContext);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    condition_id: "",
    price: "",
    image: null,
    location: "",
    is_active: true,
  });

  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showUnauthorized, setShowUnauthorized] = useState(!access);

  /* Load categories & conditions */
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [cResp, condResp] = await Promise.all([
          productAPI.getCategories(),
          productAPI.getConditions(),
        ]);

        setCategories(Array.isArray(cResp?.results) ? cResp.results : []);
        setConditions(Array.isArray(condResp?.results) ? condResp.results : []);
      } catch (err) {
        setToast({ type: "error", message: "Failed to load categories or conditions" });
      }
    };
    loadMeta();
  }, []);

  /* Load product for edit */
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const resp = await productAPI.getProductById(id);
        const data = resp?.IsSuccess ? resp.Result : resp?.Result || resp;

        if (!data) {
          setToast({ type: "error", message: "Failed to load product" });
          return;
        }

        setForm({
          title: data.title || "",
          description: data.description || "",
          category_id: data.category?.id ? String(data.category.id) : "",
          condition_id: data.condition?.id ? String(data.condition.id) : "",
          price: data.price ?? "",
          image: null,
          location: data.location || "",
          is_active: typeof data.is_active === "boolean" ? data.is_active : true,
        });
      } catch (err) {
        setToast({ type: "error", message: "Failed to load product" });
      }
    };

    load();
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      setToast({ type: "error", message: "Maximum 5 images allowed" });
      return;
    }
    const next = [...images, ...files];
    setImages(next);
    setForm((s) => ({ ...s, image: next[0] || null }));
  };

  const removeImage = (index) => {
    const next = images.filter((_, i) => i !== index);
    setImages(next);
    setForm((s) => ({ ...s, image: next[0] || null }));
  };

  const validate = () => {
    if (!form.title) return "Title is required";
    if (!form.category_id) return "Category is required";
    if (!form.condition_id) return "Condition is required";
    if (!form.price || Number.isNaN(Number(form.price))) return "Provide a valid price";
    if (!form.location) return "Location is required";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setToast({ type: "error", message: v });
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description || "");
      fd.append("category_id", form.category_id);
      fd.append("condition_id", form.condition_id);
      fd.append("price", form.price);
      fd.append("location", form.location);
      fd.append("is_active", String(form.is_active));
      if (form.image) fd.append("image", form.image);

      let resp;
      if (id) {
        resp = await productAPI.updateProduct(id, fd);
      } else {
        resp = await productAPI.createProduct(fd);
      }

      if (resp?.IsSuccess) {
        setToast({
          type: "success",
          message: id ? "Product updated successfully!" : "Product created successfully!",
        });

        setTimeout(() => {
          navigate("/products");
        }, 1500);
      } else {
        const errorMsg = Array.isArray(resp?.ErrorMessage)
          ? resp.ErrorMessage.join("; ")
          : JSON.stringify(resp?.ErrorMessage || resp);
        setToast({ type: "error", message: errorMsg });
      }
    } catch (err) {
      setToast({ type: "error", message: err.message || "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  if (!access) {
    return (
      <>
        <UnauthorizedModal 
          isOpen={showUnauthorized} 
          onClose={() => setShowUnauthorized(false)} 
        />
      </>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-green-600 hover:text-green-700 font-medium flex items-center gap-2"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              {id ? "Edit Product" : "Sell Your Item"}
            </h1>
            {id && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const resp = await apiClient(`/api/product/products/${id}/`, {
                      method: "PATCH",
                      body: { status: "sold" },
                    });
                    if (resp && (resp.IsSuccess || resp.id)) {
                      setToast({ type: "success", message: "Product marked as sold!" });
                      setTimeout(() => navigate("/my-listings"), 1500);
                    } else {
                      setToast({ type: "error", message: "Failed to mark as sold" });
                    }
                  } catch (err) {
                    setToast({ type: "error", message: err.message || "Failed to mark as sold" });
                  }
                }}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                Mark as Sold
              </button>
            )}
          </div>

          <form onSubmit={submit} className="space-y-6">
            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Images *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600 font-medium">Upload</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="block mt-4 cursor-pointer">
                  <div className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Upload up to 5 images
                  </div>
                </label>
              </div>

              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-5 gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(img)}
                        alt="preview"
                        className="w-full h-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500"
              />
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={onChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
                <select
                  name="condition_id"
                  value={form.condition_id}
                  onChange={onChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500"
                >
                  <option value="">Select condition</option>
                  {conditions.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (NPR) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg disabled:opacity-50"
              >
                {loading ? "Publishing..." : "Publish Listing"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} duration={1500} />}
    </main>
  );
}
