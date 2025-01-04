-- Ajout des contraintes sur la table reservations
ALTER TABLE public.reservations
ADD CONSTRAINT check_dates CHECK (start_date < end_date),
ADD CONSTRAINT check_amounts CHECK (
    total_amount >= 0 
    AND (deposit_amount IS NULL OR deposit_amount >= 0)
    AND (commission_amount IS NULL OR commission_amount >= 0)
    AND (subtotal IS NULL OR subtotal >= 0)
    AND (tax_amount IS NULL OR tax_amount >= 0)
);

-- Ajout des contraintes sur la table payments
ALTER TABLE public.payments
ADD CONSTRAINT check_payment_amount CHECK (amount >= 0),
ADD CONSTRAINT check_payment_date CHECK (payment_date <= CURRENT_TIMESTAMP);

-- Ajout des index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_reservations_dates 
ON public.reservations (start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_reservations_status 
ON public.reservations (status);

CREATE INDEX IF NOT EXISTS idx_payments_date 
ON public.payments (payment_date);
