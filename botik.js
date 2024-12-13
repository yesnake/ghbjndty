const { Bot, InlineKeyboard } = require('grammy');
const { Database } = require('sqlite3');

// Initialize the bot with your token
const bot = new Bot('7841454711:AAGtJCGaePzhV9-l80FOiQ9tOBq6RrBvTk8');
const webappurl = "https://bobcat-ace-flamingo.ngrok-free.app/";
const Inline = new InlineKeyboard().webApp("Open!", webappurl)

// Set up the SQLite database
const db = new Database('./database.db');

// Initialize the database (if not already created)
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT)');
});

bot.on('message', (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  console.log(ctx)
  // Ensure the user ID is valid (not undefined)
  if (userId !== undefined) {
    // Respond with the inline button to interact with the WebApp
    ctx.reply('Click on the open button to start getting Packages FULL with USDT', { reply_markup: Inline});

    // Check if the user is already in the database
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return;
      }

      if (!row) {
        // New user, add to the database
        db.run('INSERT INTO users (id, username) VALUES (?, ?)', [userId, username], (err) => {
          if (err) {
            console.error('Database insert error:', err);
          }
        });
      }
    });
  }
});

// Handle pre-checkout queries (to validate payment)
bot.on("pre_checkout_query", (ctx) => {
  return ctx.answerPreCheckoutQuery(true).catch((err) => {
    console.error("answerPreCheckoutQuery failed", err);
  });
});

// Handle successful payments
bot.on("message:successful_payment", (ctx) => {
  if (!ctx.message || !ctx.message.successful_payment || !ctx.from) {
    return;
  }

  // Acknowledge successful payment and send a thank-you message
  bot.api.sendMessage(ctx.from.id, "Thanks! Now you're using our Blocks system! Good luck!");

  console.log("Successful payment:", ctx.message.successful_payment);
});



// Start the bot
bot.start();
