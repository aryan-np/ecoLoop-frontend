import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../api/client";
import AuthContext from "../auth/AuthProvider";
import Input from "../components/Input";
import Button from "../components/Button";
import Toast from "../components/Toast";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { access } = useContext(AuthContext);
  const [form, setForm] = useState({ title: "", description: "", category: "", condition: "used", price: "", is_free: false });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const resp = await apiClient(`/api/product/products/${id}/`, { method: "GET" });
        if (resp.IsSuccess) setForm({ ...resp.Result, price: resp.Result.price || "" });
        else {
          const errorMsg = Array.isArray(resp.ErrorMessage) ? resp.ErrorMessage.join("; ") : JSON.stringify(resp.ErrorMessage);
          setToast({ type: "error", message: errorMsg });
        }
      } catch (err) {
        setToast({ type: "error", message: err.message || "Failed to load product" });
      }
    };
    load();
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    if (!form.title) return "Title is required";
    if (!form.category) return "Category is required";
    if (!form.is_free && (!form.price || Number.isNaN(Number(form.price)))) return "Provide a valid price or mark as free";
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
      if (id) {
        const resp = await apiClient(`/api/product/products/${id}/`, { method: "PUT", body: form });
        if (resp.IsSuccess) {
          setToast({ type: "success", message: "Product updated successfully!" });
          setTimeout(() => navigate(`/products/${id}`), 2000);
        } else {
          const errorMsg = Array.isArray(resp.ErrorMessage) ? resp.ErrorMessage.join("; ") : JSON.stringify(resp.ErrorMessage);
          setToast({ type: "error", message: errorMsg });
        }
      } else {
        const resp = await apiClient(`/api/product/products/`, { method: "POST", body: form });
        if (resp.IsSuccess) {
          setToast({ type: "success", message: "Product created successfully!" });
          setTimeout(() => navigate(`/products/${resp.Result.id}`), 2000);
        } else {
          const errorMsg = Array.isArray(resp.ErrorMessage) ? resp.ErrorMessage.join("; ") : JSON.stringify(resp.ErrorMessage);
          setToast({ type: "error", message: errorMsg });
        }
      }
    } catch (err) {
      setToast({ type: "error", message: err.message || "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  if (!access) return <div className="container-main max-w-md mx-auto card">Please login to create or edit a product.</div>;

  return (
    <main className="container-main max-w-md mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-[color:var(--text-primary)]">{id ? "Edit Product" : "Create Product"}</h2>
        <form onSubmit={submit} className="form-row">
          <Input label="Title" name="title" value={form.title} onChange={onChange} />
          <Input label="Category" name="category" value={form.category} onChange={onChange} />
          <div>
            <label className="block text-sm mb-1 text-[color:var(--text-secondary)]">Condition</label>
            <select name="condition" value={form.condition} onChange={onChange} className="input">
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>
          <Input label="Description" name="description" value={form.description} onChange={onChange} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_free" name="is_free" checked={form.is_free} onChange={onChange} />
            <label htmlFor="is_free" className="text-[color:var(--text-secondary)]">Is free</label>
          </div>
          {!form.is_free && <Input label="Price" name="price" value={form.price} onChange={onChange} />}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : id ? "Save" : "Create"}</Button>
          </div>
        </form>
      </div>

      {/* Toast for notifications */}
      {toast && <Toast type={toast.type} message={toast.message} duration={2000} />}
    </main>
  );
}
