-- Add games table data
INSERT INTO "public"."games" ("title", "imageUrl", "gifUrl", "hasDiscount", "isActual", "isEnabled", "appleStoreUrl", "googlePlayUrl", "trailerUrl", "createdAt", "updatedAt") VALUES
  (
    '📲 Asphalt Legends - Racing Game',
    'https://i.ibb.co/BHqtVK4Q/PLmy-Zqt-Hm-PZ.jpg',
    'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExc25iMG9hcXpnamUzMmV3ZWd2cGtqb2F5NGwyajA3a21tb3B1c3c1biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LDjKkXTfIPZ7zYOcvq/giphy.gif',
    true,
    true,
    true,
    'https://apps.apple.com/us/app/asphalt-legends-racing-game/id805603214',
    'https://play.google.com/store/apps/details?id=com.gameloft.android.ANMP.GloftA9HM',
    'https://youtu.be/TEuZZB_zSOw',
    NOW(),
    NOW()
  ),
  (
    '📲 EA SPORTS FC™ Mobile Football',
    'https://i.ibb.co/8gqJrKMF/Ysdb-Aauqynx.jpg',
    'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWdqbGlqNnV3cG9nejc4anNudm5ycXE3bmhkMWhjZnlxejlsejExNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Br5i1DgRrNT9uCvssd/giphy.gif',
    false,
    true,
    true,
    'https://apps.apple.com/us/app/ea-sports-fc-mobile-soccer/id1094930513',
    'https://play.google.com/store/apps/details?id=com.ea.gp.fifamobile',
    'https://youtu.be/TEuZZB_zSOw',
    NOW(),
    NOW()
  );
