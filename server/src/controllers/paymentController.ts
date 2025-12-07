import { Request, Response } from 'express';
import { CryptoPay } from '@foile/crypto-pay-api';
import { logger } from '../config/logger';
// MONGO BACKUP: import Payment from '../models/Payment';
// MONGO BACKUP: import Game from '../models/Game';
// MONGO BACKUP: import Offer from '../models/Offer';
import axios from "axios";
import { prisma } from '../db/client';
import { paymentRepository } from '../db';

const cryptoPay = new CryptoPay(process.env.CRYPTOPAY_API_KEY!);

export const createCryptoInvoice = async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser?.id;
    const { gameName, offerName, price } = req.body;

    // Validate price
    const amountToPay = parseFloat(price);
    if (isNaN(amountToPay) || amountToPay <= 0) {
      logger.error("Validation data for new crypto invoice failed: Invalid price provided", {
        context: { userId, gameName, offerName, price, stack: new Error("Invalid price provided").stack },
      });
      return res.status(400).json({ error: "Invalid price" });
    }

    if (!userId || userId <= 0) {
      logger.error("Validation data for new crypto invoice failed: Invalid userId provided", {
        context: { userId, gameName, offerName, price, stack: new Error("Invalid userId provided").stack },
      });
      return res.status(400).json({ error: "Invalid userId" });
    }

    // MONGO BACKUP: const game = await Game.findOne({ title: gameName }).select('_id').lean().exec();
    // MONGO BACKUP: const gameIdValue = game?._id;
    const game = await prisma.game.findFirst({
      where: { title: gameName },
      select: { id: true }
    });
    const gameIdValue = game?.id;
    
    if (!gameIdValue) {
      logger.error("Validation data for new crypto invoice failed: Game not found", {
        context: { userId, gameName, offerName, price },
      });
      return res.status(404).json({ error: "Game not found" });
    }

    // MONGO BACKUP: const offer = await Offer.findOne({ title: offerName, gameId: gameIdValue }).select('_id').lean().exec();
    // MONGO BACKUP: const offerIdValue = offer?._id;
    const offer = await prisma.offer.findFirst({
      where: { 
        title: offerName, 
        gameId: gameIdValue 
      },
      select: { id: true }
    });
    const offerIdValue = offer?.id;
    
    if (!offerIdValue) {
      logger.error("Validation data for new crypto invoice failed: Offer not found", {
        context: { userId, gameName, offerName, price },
      });
      return res.status(404).json({ error: "Offer not found" });
    }

    // Construct hidden message for the invoice
    const hiddenMessage = `🔗 Bot: https://t.me/TipTop999_bot\n🛒 Please visit the bot to complete your order 👇`;

    logger.info("Creating crypto invoice", {
      context: { userId, offerId: offerIdValue },
    });

    // Create invoice using CryptoPay API
    const invoice = await cryptoPay.createInvoice("USDT", amountToPay, {
      hidden_message: hiddenMessage,
      allow_comments: true,
      allow_anonymous: false,
      paid_btn_name: "openBot",
      paid_btn_url: `https://t.me/TipTop999_bot`,
    });

    if (!invoice || !invoice.pay_url) {
      logger.error("Crypto invoice creation failed or missing payment URL", {
        context: { userId, payUrl: invoice?.pay_url, offerId: offerIdValue, stack: new Error("Invoice creation failed").stack },
      });
      return res.status(500).json({ error: "Invoice creation failed" });
    }

    logger.info("Invoice created successfully", {
      context: { userId, invoiceId: invoice.invoice_id, orderId: null, offerId: offerIdValue },
    });

    // MONGO BACKUP: const payment = new Payment({
    // MONGO BACKUP:   externalId: invoice.invoice_id,
    // MONGO BACKUP:   userId: userId,
    // MONGO BACKUP:   orderId: null,
    // MONGO BACKUP:   offerId: offerIdValue,
    // MONGO BACKUP:   amountToPay: amountToPay,
    // MONGO BACKUP:   currency: "USDT",
    // MONGO BACKUP:   status: "pending",
    // MONGO BACKUP: });
    // MONGO BACKUP: await payment.save();

    const payment = await paymentRepository.create({
      externalId: invoice.invoice_id,
      user: { connect: { id: userId } },
      offer: { connect: { id: offerIdValue } },
      amountToPay: amountToPay,
      currency: "USDT",
      status: "pending",
    });

    logger.info("Payment record saved successfully", {
      context: { userId, paymentId: payment.id, invoiceId: invoice.invoice_id },
    });

    // Respond with the invoice details
    return res.status(201).json({
      success: true,
      invoice: {
        status: invoice.status,
        payUrl: invoice.pay_url,
        miniAppInvoiceUrl: invoice.mini_app_invoice_url,
      }
    });
  } catch (error: any) {
    logger.error("Error creating crypto invoice", {
      context: { 
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      },
    });
    return res.status(500).json({ 
      error: "Failed to create invoice",
      details: error.message 
    });
  }
};

export const getAllByMe = async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser?.id;

    if (!userId || userId <= 0) {
      logger.error("Validation data for fetching payments failed: Invalid userId provided", {
        context: { userId, stack: new Error("Invalid userId provided").stack },
      });
      return res.status(400).json({ error: "Invalid userId" });
    }

    // MONGO BACKUP: const payments = await Payment.find({ userId }).exec();
    const payments = await paymentRepository.findByUserId(userId);

    if (!payments || payments.length === 0) {
      logger.info("No payments found for the given userId", {
        context: { userId },
      });
      return res.status(404).json({ error: "No payments found" });
    }

    return res.status(200).json(payments);
  } catch (error) {
    logger.error("Error fetching payments", {
      context: { stack: error },
    });
    return res.status(500).json({ error: "Failed to fetch payments" });
  }
}

export const createRubInvoice = async (req: Request, res: Response) => {
  try {
    const userId = req.telegramUser?.id;
    const { gameName, offerName, price } = req.body;

    // Validate price
    const amountToPay = parseFloat(price);
    if (isNaN(amountToPay) || amountToPay < 100) {
      logger.error("Validation data for new rub invoice failed: Invalid price provided", {
        context: { userId, gameName, offerName, price, stack: new Error("Invalid price provided").stack },
      });
      return res.status(400).json({ error: "Invalid price" });
    }

    if (!userId || userId <= 0) {
      logger.error("Validation data for new rub invoice failed: Invalid userId provided", {
        context: { userId, gameName, offerName, price, stack: new Error("Invalid userId provided").stack },
      });
      return res.status(400).json({ error: "Invalid userId" });
    }

    // MONGO BACKUP: const game = await Game.findOne({ title: gameName }).select('_id').lean().exec();
    // MONGO BACKUP: const gameIdValue = game?._id;
    const game = await prisma.game.findFirst({
      where: { title: gameName },
      select: { id: true }
    });
    const gameIdValue = game?.id;

    if (!gameIdValue) {
      logger.error("Validation data for new rub invoice failed: Game not found", {
        context: { userId, gameName, offerName, price },
      });
      return res.status(404).json({ error: "Game not found" });
    }

    // MONGO BACKUP: const offer = await Offer.findOne({ title: offerName, gameId: gameIdValue }).select('_id').lean().exec();
    // MONGO BACKUP: const offerIdValue = offer?._id;
    const offer = await prisma.offer.findFirst({
      where: { 
        title: offerName, 
        gameId: gameIdValue 
      },
      select: { id: true }
    });
    const offerIdValue = offer?.id;
    
    if (!offerIdValue) {
      logger.error("Validation data for new rub invoice failed: Offer not found", {
        context: { userId, gameName, offerName, price },
      });
      return res.status(404).json({ error: "Offer not found" });
    }

    logger.info("Creating rub invoice", {
      context: { userId, offerId: offerIdValue },
    });

    // Create a rub invoice using BLVCKPAY API
    let invoice: {
      "urlv2": string;
      "order_id": string;
      "status": string;
    };

    try {
      invoice = await axios.post("https://payment.blvckpay.com/sbp/order/create", {
        "amount": amountToPay,
        "signature": "b28fa2bb-27dd-47a7-a52d-1448ef716d90",
      })
    } catch (error) {
      logger.error("Error creating rub invoice", {
        context: { stack: error },
      });
      return res.status(500).json({ error: "Failed to create invoice" });
    }

    if (!invoice || !invoice.urlv2) {
      logger.error("Crypto invoice creation failed or missing payment URL", {
        context: { userId, payUrl: invoice?.urlv2, offerId: offerIdValue, stack: new Error("Invoice creation failed").stack },
      });
      return res.status(500).json({ error: "Invoice creation failed" });
    }

    logger.info("Invoice created successfully", {
      context: { userId, invoiceId: invoice.order_id, orderId: null, offerId: offerIdValue },
    });

    // MONGO BACKUP: const payment = new Payment({
    // MONGO BACKUP:   externalId: invoice.order_id,
    // MONGO BACKUP:   userId: userId,
    // MONGO BACKUP:   orderId: null,
    // MONGO BACKUP:   offerId: offerIdValue,
    // MONGO BACKUP:   amountToPay: amountToPay,
    // MONGO BACKUP:   currency: "RUB",
    // MONGO BACKUP:   status: "pending",
    // MONGO BACKUP: });
    // MONGO BACKUP: await payment.save();

    const payment = await paymentRepository.create({
      externalId: invoice.order_id,
      user: { connect: { id: userId } },
      offer: { connect: { id: offerIdValue } },
      amountToPay: amountToPay,
      currency: "RUB",
      status: "pending",
    });

    logger.info("Payment record saved successfully", {
      context: { userId, paymentId: payment.id, invoiceId: invoice.order_id },
    });

    // Respond with the invoice details
    return res.status(201).json({
      success: true,
      invoice: {
        status: invoice.status,
        payUrl: invoice.urlv2,
      }
    });
  } catch (error) {
    logger.error("Error creating rub invoice", {
      context: { stack: error },
    });
    return res.status(500).json({ error: "Failed to create invoice" });
  }
};
