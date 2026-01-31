package cz.vh.lide.core.tools;

import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Function;

import cz.vh.lide.db.entity.BaseEntity;
import lombok.NonNull;
import lombok.experimental.UtilityClass;

@UtilityClass
public class JpaTools {

  /**
   * Safely links a child entity to its owner by setting the owner on the child and
   * adding the child to the owner's collection if present and not already contained.
   *
   * @param owner        the owning entity to link to
   * @param child        the child entity to link
   * @param listGetter   function to retrieve the owner's child collection
   * @param ownerSetter  consumer to set the owner on the child
   * @param <OWNER>      type of the owning entity
   * @param <CHILD>      type of the child entity
   */
  public static <OWNER extends BaseEntity, CHILD extends BaseEntity> void safeLink(
      @NonNull OWNER owner,
      @NonNull CHILD child,
      @NonNull Function<OWNER, List<CHILD>> listGetter,
      @NonNull BiConsumer<CHILD, OWNER> ownerSetter) {
    if (ownerSetter != null) {
      ownerSetter.accept(child, owner);
    }
    var list = listGetter != null ? listGetter.apply(owner) : null;
    if (list != null && !list.contains(child)) {
      list.add(child);
    }
  }

  /**
   * Safely links two entities in a many-to-many relationship by adding each to the other's
   * collection if present and not already contained.
   *
   * @param left             the left entity
   * @param right            the right entity
   * @param leftListGetter   function to retrieve the left collection
   * @param rightListGetter  function to retrieve the right collection
   * @param <LEFT>           type of the left entity
   * @param <RIGHT>          type of the right entity
   */
  public static <LEFT extends BaseEntity, RIGHT extends BaseEntity> void safeLinkManyToMany(
      @NonNull LEFT left,
      @NonNull RIGHT right,
      @NonNull Function<LEFT, List<RIGHT>> leftListGetter,
      @NonNull Function<RIGHT, List<LEFT>> rightListGetter) {
    var leftList = leftListGetter != null ? leftListGetter.apply(left) : null;
    if (leftList != null && !leftList.contains(right)) {
      leftList.add(right);
    }

    var rightList = rightListGetter != null ? rightListGetter.apply(right) : null;
    if (rightList != null && !rightList.contains(left)) {
      rightList.add(left);
    }
  }
}
