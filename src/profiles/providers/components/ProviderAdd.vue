<template>
  <div class="provider-add">
    <h2>Agregar Proveedor</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label>Nombre:</label>
        <input v-model="form.name" required />
      </div>
      <div>
        <label>Dirección:</label>
        <input v-model="form.address" required />
      </div>
      <div>
        <label>Email:</label>
        <input v-model="form.email" required type="email" />
      </div>
      <div>
        <label>Teléfono:</label>
        <input v-model="form.phone" required />
      </div>
      <div>
        <label>Estado:</label>
        <select v-model="form.state">
          <option value="active">active</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>
      <div v-if="showProviderId">
        <label>ID del Proveedor:</label>
        <input v-model="form.providerId" type="number" min="1" />
        <small>Ingrese el ID del proveedor si ya lo conoce.</small>
      </div>
      <div v-if="isManualSupplyEntry">
        <h3>Información de Suministro Inicial</h3>
        <div>
          <label>Nombre del Suministro:</label>
          <input v-model="supplyForm.name" required />
        </div>
        <div>
          <label>Recurso:</label>
          <input v-model="supplyForm.resource" required />
        </div>
        <div>
          <label>Precio:</label>
          <input v-model="supplyForm.price" type="number" min="0" step="0.01" />
        </div>
        <div>
          <label>Stock:</label>
          <input v-model="supplyForm.stock" type="number" min="0" />
        </div>
      </div>
      <div class="form-actions">
        <label class="toggle-label">
          <input type="checkbox" v-model="isManualSupplyEntry" />
          Configuración avanzada de suministro
        </label>
        <label class="toggle-label">
          <input type="checkbox" v-model="showProviderId" />
          Especificar ID manualmente
        </label>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import Provider from '../../providers/models/Provider.js';
import ProviderService from '../../providers/services/ProviderService.js';

export default {
  name: 'ProviderAdd',
  setup() {
    const router = useRouter();
    const providerService = new ProviderService();
    const form = ref({
      name: '',
      address: '',
      email: '',
      phone: '',
      state: 'active',
      providerId: '' // ID manual opcional
    });

    const supplyForm = ref({
      name: 'Insumo inicial',
      resource: 'Default Resource', // Campo obligatorio que faltaba
      price: 0,
      stock: 0
    });

    const isLoading = ref(false);
    const error = ref('');
    const showProviderId = ref(false);
    const isManualSupplyEntry = ref(false);

    const handleSubmit = async () => {
      isLoading.value = true;
      error.value = '';
      try {
        // Validar datos del formulario
        const provider = new Provider(
            showProviderId.value ? form.value.providerId : null, // Usar el ID manual si está disponible
            form.value.name,
            form.value.address,
            form.value.email,
            form.value.phone,
            form.value.state
        );
        const { isValid, errors } = provider.validateData();
        if (!isValid) {
          error.value = errors.join('\n');
          isLoading.value = false;
          return;
        }

        // Obtener el hotel ID para asociar el proveedor
        const hotelId = await providerService.getHotelIdFromToken();
        if (!hotelId) {
          throw new Error('No se pudo obtener el ID del hotel. Por favor inicie sesión nuevamente.');
        }

        let providerId;

        // Si no se proporciona un ID manualmente, crear el proveedor
        if (!showProviderId.value || !form.value.providerId) {
          // Crear el proveedor con datos que el backend espera
          const providerData = {
            ...provider.toJson(),
            hotelId: hotelId,
            // Eliminamos el ID para permitir que el backend lo genere
            id: undefined
          };

          console.log('Enviando datos de proveedor:', providerData);
          const response = await providerService.createProvider(providerData);

          // Verificar respuesta y extraer ID
          console.log('Respuesta completa:', response);

          // Validación más flexible para el ID del proveedor
          providerId = null;

          if (response) {
            if (response.id) {
              providerId = response.id;
            } else if (response.data && response.data.id) {
              providerId = response.data.id;
            } else if (typeof response === 'object') {
              // Buscar alguna propiedad que pueda ser el ID
              for (const key in response) {
                if (key.toLowerCase().includes('id') && response[key]) {
                  providerId = response[key];
                  break;
                }
              }
            } else if (typeof response === 'number' ||
                (typeof response === 'string' && !isNaN(parseInt(response)))) {
              providerId = typeof response === 'number' ? response : parseInt(response);
            }
          }

          if (!providerId) {
            // Si no encontramos ID y estamos en desarrollo, podríamos usar uno temporal
            if (window.location.hostname === 'localhost') {
              console.warn('No se encontró ID en la respuesta, usando ID temporal para desarrollo');
              providerId = Date.now(); // ID temporal para pruebas
            } else {
              throw new Error('La respuesta del servidor no contiene el ID del proveedor creado');
            }
          }

          console.log('Proveedor creado con ID:', providerId);
        } else {
          // Usar el ID proporcionado manualmente
          providerId = parseInt(form.value.providerId);
          console.log('Usando ID de proveedor proporcionado manualmente:', providerId);
        }

        // 2. Crear supply para el provider con el campo resource añadido
        const supplyData = {
          providersId: providerId,
          name: isManualSupplyEntry.value ? supplyForm.value.name : 'Insumo inicial',
          resource: isManualSupplyEntry.value ? supplyForm.value.resource : 'Default Resource', // AQUÍ ESTÁ LA CORRECCIÓN: Se incluye el campo resource
          price: isManualSupplyEntry.value ? parseFloat(supplyForm.value.price) : 0.0,
          stock: isManualSupplyEntry.value ? parseInt(supplyForm.value.stock) : 0,
          state: 'active',
          hotelId: hotelId // Asegurarnos de incluir el hotelId en cada petición
        };

        console.log('Enviando datos de suministro:', supplyData);
        const supply = await providerService.createSupply(supplyData);
        console.log('Suministro creado:', supply);

        // Validación del objeto supply
        if (!supply || typeof supply !== 'object') {
          throw new Error('Error al crear el suministro: respuesta inválida');
        }

        // 3. Obtener ownerId
        const ownerId = await providerService.getOwnerIdFromToken();
        if (!ownerId) {
          throw new Error('No se pudo obtener el ID del propietario desde el token');
        }
        console.log('Owner ID obtenido:', ownerId);

        // 4. Crear payment owner
        const paymentOwnerData = {
          ownerId: ownerId,
          description: 'Pago inicial',
          finalAmount: 0,
          hotelId: hotelId // Incluir hotelId en todos los recursos
        };

        console.log('Enviando datos de payment owner:', paymentOwnerData);
        const paymentOwner = await providerService.createPaymentOwner(paymentOwnerData);
        console.log('Payment owner creado:', paymentOwner);

        if (!paymentOwner || typeof paymentOwner !== 'object') {
          throw new Error('Error al crear el pago: respuesta inválida');
        }

        // Obtener el ID del pago de manera flexible
        let paymentId = null;
        if (paymentOwner.id) {
          paymentId = paymentOwner.id;
        } else if (paymentOwner.data && paymentOwner.data.id) {
          paymentId = paymentOwner.data.id;
        } else {
          // Buscar alguna propiedad que pueda ser el ID
          for (const key in paymentOwner) {
            if (key.toLowerCase().includes('id') && paymentOwner[key]) {
              paymentId = paymentOwner[key];
              break;
            }
          }
        }

        if (!paymentId && window.location.hostname === 'localhost') {
          console.warn('No se encontró ID en la respuesta de paymentOwner, usando ID temporal');
          paymentId = Date.now() + 1; // ID temporal para pruebas
        } else if (!paymentId) {
          throw new Error('No se pudo obtener el ID del pago creado');
        }

        // 5. Crear supplies request
        const supplyId = supply.id || (supply.data && supply.data.id);
        if (!supplyId && window.location.hostname !== 'localhost') {
          throw new Error('No se pudo obtener el ID del suministro creado');
        }

        const suppliesRequestData = {
          paymentsOwnersId: paymentId,
          suppliesId: supplyId || Date.now() + 2, // Usar ID temporal si no hay
          count: 1,
          amount: 0,
          hotelId: hotelId // Incluir hotelId en todos los recursos
        };

        console.log('Enviando datos de supplies request:', suppliesRequestData);
        await providerService.createSuppliesRequest(suppliesRequestData);

        document.dispatchEvent(new Event('provider-added'));
        router.push('/providers');
      } catch (e) {
        error.value = 'Error al crear proveedor: ' + (e.message || e);
        console.error('Error completo:', e);
      } finally {
        isLoading.value = false;
      }
    };

    return {
      form,
      supplyForm,
      isLoading,
      error,
      handleSubmit,
      showProviderId,
      isManualSupplyEntry
    };
  }
};
</script>

<style scoped>
.provider-add {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

form > div {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

input, select {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
}

input:focus, select:focus {
  border-color: #474C74;
  outline: none;
  box-shadow: 0 0 0 2px rgba(71, 76, 116, 0.2);
}

button {
  background: #474C74;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

button:hover {
  background: #383c5d;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  color: #dc3545;
  margin-top: 16px;
  padding: 10px;
  background-color: #fff0f0;
  border-left: 4px solid #dc3545;
  border-radius: 4px;
}

h3 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-size: 18px;
  color: #474C74;
}

small {
  color: #666;
  display: block;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.toggle-label input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}
</style>