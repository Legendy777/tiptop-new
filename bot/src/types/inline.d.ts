export interface InlineQueryResult {
  type: 'article';
  id: string;
  title: string;
  description?: string;
  thumb_url?: string;
  thumb_width?: number;
  thumb_height?: number;
  input_message_content: {
    message_text: string;
    parse_mode?: 'HTML' | 'Markdown';
  };
  reply_markup?: {
    inline_keyboard: Array<Array<{
      text: string;
      url?: string;
      callback_data?: string;
      start_parameter?: string;
    }>>;
  };
}

export interface InlineQueryButton {
  text: string;
  start_parameter?: string;
}