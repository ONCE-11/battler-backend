CREATE INDEX characters_user_id_alive_idx ON public.characters USING btree (user_id, alive);

CREATE INDEX fights_game_over_idx ON public.fights USING btree (game_over);

CREATE INDEX fights_player1_id_idx ON public.fights USING btree (player1_id);

CREATE INDEX fights_player2_id_idx ON public.fights USING btree (player2_id);


