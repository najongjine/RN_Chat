import { TarotCardType } from "@/app/type/types";
import React from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type TarotCardPickerModalProps = {
  cards: TarotCardType[];
  visible: boolean;
  selectedCard?: TarotCardType | null;
  onClose: () => void;
  onSelectCard: (card: TarotCardType) => void;
};

export function TarotCardPickerModal({
  cards,
  visible,
  selectedCard,
  onClose,
  onSelectCard,
}: TarotCardPickerModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>타로 카드 선택</Text>
            <Pressable
              accessibilityRole="button"
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </Pressable>
          </View>

          <FlatList
            data={cards}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.cardList}
            columnWrapperStyle={styles.cardRow}
            renderItem={({ item }) => {
              const isSelected = selectedCard?.id === item.id;

              return (
                <Pressable
                  accessibilityRole="button"
                  style={[styles.cardItem, isSelected && styles.selectedCard]}
                  onPress={() => onSelectCard(item)}
                >
                  <Image source={item.image} style={styles.cardImage} />
                  <Text style={styles.cardName} numberOfLines={2}>
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  sheet: {
    height: "82%",
    paddingTop: 14,
    paddingHorizontal: 14,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222222",
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#eeeeee",
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  cardList: {
    paddingBottom: 24,
  },
  cardRow: {
    gap: 10,
  },
  cardItem: {
    flex: 1,
    minHeight: 178,
    marginBottom: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  selectedCard: {
    borderColor: "#6f55ff",
    backgroundColor: "#f1efff",
  },
  cardImage: {
    width: "100%",
    aspectRatio: 0.62,
    borderRadius: 6,
    backgroundColor: "#e8e8e8",
  },
  cardName: {
    minHeight: 36,
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    textAlign: "center",
    color: "#222222",
  },
});
