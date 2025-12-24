-- Seed Data for Future Lab
-- Insert some initial concepts
INSERT INTO public.concepts (title, description, image_url, vote_count, vote_goal, status)
VALUES 
('Cyber-Punk Utility Vest', 'A modular vest with integrated LED strips and 12 tactical pockets for the modern urban explorer.', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop', 42, 100, 'voting'),
('Aetheric Silk Hoodie', 'Ultra-lightweight hoodie made from bio-engineered spider silk. Breathable, durable, and slightly holographic.', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop', 89, 150, 'voting'),
('Grav-Defy Sneakers', 'Conceptual footwear with magnetic cushioning that feels like walking on air. (Beta testing)', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop', 156, 150, 'approved');
