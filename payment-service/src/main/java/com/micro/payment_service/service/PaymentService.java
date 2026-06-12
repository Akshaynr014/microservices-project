package com.micro.payment_service.service;

import com.micro.payment_service.feign.OrderClient;
import com.micro.payment_service.feign.UserClient;
import com.micro.payment_service.model.Payment;
import com.micro.payment_service.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository repository;

    @Autowired
    private OrderClient orderClient;

    @Autowired
    private UserClient userClient;

    // ── Add these two keys to application.properties:
    //    razorpay.key.id=rzp_test_XXXX
    //    razorpay.key.secret=YOUR_SECRET
    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    // ─────────────────────────────────────────────────────────────────────────
    // ✅ FIXED: Calls the real Razorpay API to create an order.
    //    Returns a genuine order ID like "order_ABC123XYZ" that Checkout accepts.
    // ─────────────────────────────────────────────────────────────────────────
    public Map<String, Object> createRazorpayOrder(double amount, String internalOrderId)
            throws RazorpayException {

        RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int)(amount * 100));   // paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "order_" + internalOrderId);
        orderRequest.put("payment_capture", 1);

        Order razorpayOrder = client.orders.create(orderRequest);

        Map<String, Object> response = new HashMap<>();
        // Fixed: Explicitly cast the return values
        response.put("id", razorpayOrder.get("id").toString());          // real Razorpay order_id
        response.put("amount", razorpayOrder.get("amount"));              // in paise
        response.put("currency", razorpayOrder.get("currency").toString());
        response.put("orderId", internalOrderId);                        // your DB order id

        System.out.println("✅ Razorpay order created: " + response.get("id"));
        return response;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ✅ FIXED: Verifies the Razorpay signature using HMAC-SHA256.
    //    Prevents accepting fake/tampered payment callbacks.
    // ─────────────────────────────────────────────────────────────────────────
    public boolean verifyPayment(String razorpayOrderId,
                                 String razorpayPaymentId,
                                 String razorpaySignature) {
        try {
            String payload = razorpayOrderId + "|" + razorpayPaymentId;

            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"
            ));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));

            // Java 17+: HexFormat; for Java 11 use apache commons or manual hex
            String generated = HexFormat.of().formatHex(hash);
            boolean valid = generated.equals(razorpaySignature);
            System.out.println(valid ? "✅ Signature valid" : "❌ Signature mismatch");
            return valid;

        } catch (Exception e) {
            System.err.println("Signature verification error: " + e.getMessage());
            return false;
        }
    }

    // ── Existing methods (unchanged) ─────────────────────────────────────────

    public Payment createPayment(Payment payment) {
        try {
            orderClient.getOrder(payment.getOrderId());
            if (payment.getTransactionId() == null) {
                payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            }
            payment.setPaymentDate(LocalDateTime.now());
            if (payment.getStatus() == null) payment.setStatus("SUCCESS");

            orderClient.updateOrderStatus(payment.getOrderId(), "PAID");
            return repository.save(payment);

        } catch (Exception e) {
            payment.setStatus("FAILED");
            payment.setTransactionId("TXN-FAILED");
            payment.setPaymentDate(LocalDateTime.now());
            throw new RuntimeException("Order not found or payment failed: " + e.getMessage());
        }
    }

    public List<Payment> getAllPayments() {
        List<Payment> payments = repository.findAll();
        for (Payment payment : payments) {
            try {
                Object order = orderClient.getOrder(payment.getOrderId());
                payment.setOrderDetails(order);
                payment.setUserDetails(getUserFromOrder(order));
            } catch (Exception e) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "Service unavailable");
                payment.setOrderDetails(err);
                payment.setUserDetails(err);
            }
        }
        return payments;
    }

    public Payment getPaymentById(Long id) {
        Payment payment = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + id));
        enrichPayment(payment);
        return payment;
    }

    public Payment getPaymentByOrderId(Long orderId) {
        Payment payment = repository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order: " + orderId));
        enrichPayment(payment);
        return payment;
    }

    public Payment updatePaymentStatus(Long id, String status) {
        Payment payment = getPaymentById(id);
        payment.setStatus(status);
        return repository.save(payment);
    }

    public List<Payment> getPaymentsByStatus(String status) {
        return repository.findByStatus(status);
    }

    public void deletePayment(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Payment not found: " + id);
        }
        repository.deleteById(id);
    }

    public Object getPaymentWithDetails(Long id) {
        Payment payment = getPaymentById(id);
        Object order = orderClient.getOrder(payment.getOrderId());
        Object user  = getUserFromOrder(order);

        final Long    fId  = payment.getId();
        final Long    fOrd = payment.getOrderId();
        final Double  fAmt = payment.getAmount();
        final String  fSt  = payment.getStatus();
        final String  fTxn = payment.getTransactionId();
        final Object  fO   = order;
        final Object  fU   = user;

        return new Object() {
            public final Long    id             = fId;
            public final Long    orderId        = fOrd;
            public final Double  amount         = fAmt;
            public final String  status         = fSt;
            public final String  transactionId  = fTxn;
            public final Object  orderDetails   = fO;
            public final Object  userDetails    = fU;
        };
    }

    private void enrichPayment(Payment payment) {
        try {
            Object order = orderClient.getOrder(payment.getOrderId());
            payment.setOrderDetails(order);
            payment.setUserDetails(getUserFromOrder(order));
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Could not fetch details");
            payment.setOrderDetails(err);
            payment.setUserDetails(err);
        }
    }

    private Object getUserFromOrder(Object order) {
        try {
            return userClient.getUser(1L);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "User service unavailable");
            return err;
        }
    }
}